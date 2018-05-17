package com.districtgen.districtgen.manager;

import com.districtgen.districtgen.entity.*;
import com.districtgen.districtgen.repository.AreaRepository;
import com.districtgen.districtgen.repository.MeasurementProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.Getter;
import org.geojson.Feature;
import org.geojson.FeatureCollection;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Getter

@Component
public class AreaManager {
    private final String MARYLAND_PATH = "/mapdata/md_data.geojson";
    private final String VIRGINIA_PATH = "/mapdata/va_data.geojson";
    private final String VIRGINIA_TEST_PATH = "/mapdata/va_data_sample.geojson";
    private final String WESTVIRGINIA_PATH = "/mapdata/wv_data.geojson";

    private final String MARYLAND_ID = "MD";
    private final String VIRGINIA_ID = "VA";
    private final String WESTVIRGINIA_ID = "WV";

    private final String CD_PROPERTY = "congress";
    private final String NEIGHBORS_PROPERTY = "neighbors";
    private final String GEO_ID_PROPERTY = "GEOID";
    private final String DISPLAY_NAME_PROPERTY = "NAMELSAD10";
    private final String ONBORDER_PROPERTY = "onBorder";
    private final String RESIDENT_PROPERTY = "resident";
    private final String AREA_PROPERTY = "area";
    private final String PERIMETER_PROPERTY = "perim";

    private final String TOTALPOP_PROPERTY = "pop";
    private final String DEMOCRATIC_PROPERTY = "dem";
    private final String REPUBLICAN_PROPERTY = "gop";
    private final String THIRDPARTY_PROPERTY = "thd";
    private final String WHITE_PROPERTY = "wa";
    private final String BLACK_PROPERTY = "ba";
    private final String ASIAN_PROPERTY = "aa";
    private final String NATIVEAMERICAN_PROPERTY = "na";
    private final String PACIFICISLANDER_PROPERTY = "ia";
    private final String TWOORMORE_PROPERTY = "tom";

    @Autowired
    private AreaRepository areaRepository;
    @Autowired
    private MeasurementProfileRepository measurementProfileRepository;

    private Map<String, FeatureCollection> defaultVotingDistrictFeaturesByStateName;
    private Map<String, Feature> votingDistrictFeaturesByName;
    private Map<String, State> statesByName;
    private Map<String, CongressionalDistrict> congressionalDistrictsByName;
    private Map<String, VotingDistrict> votingDistrictsByName;
    private Map<String, List<String>> neighborsByName;

    private boolean isTest = false;

    public AreaManager() {
        defaultVotingDistrictFeaturesByStateName = new HashMap<>();
        votingDistrictFeaturesByName = new HashMap<>();
        votingDistrictsByName = new HashMap<>();
        congressionalDistrictsByName = new HashMap<>();
        statesByName = new HashMap<>();
        neighborsByName = new HashMap<>();

        generateMap(MARYLAND_ID, MARYLAND_PATH);
        if(isTest){
            generateMap(VIRGINIA_ID, VIRGINIA_TEST_PATH);
        }
        else {
            generateMap(VIRGINIA_ID, VIRGINIA_PATH);
        }
        generateMap(WESTVIRGINIA_ID, WESTVIRGINIA_PATH);
        populateNeighbors();

        generateState(MARYLAND_ID);
        generateState(VIRGINIA_ID);
        generateState(WESTVIRGINIA_ID);
    }

    public FeatureCollection loadFeatureCollection(String path) {
        FeatureCollection fc = null;
        try {
            File votingDistricts = ResourceUtils
                    .getFile(this.getClass().getResource(path));
            fc = new ObjectMapper()
                    .readValue(new FileInputStream(votingDistricts), FeatureCollection.class);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return fc;
    }

    public void generateMap(String stateName, String path) {
        FeatureCollection fc = loadFeatureCollection(path);
        defaultVotingDistrictFeaturesByStateName.put(stateName, fc);

        //create and map vd's and their features separately
        for (Feature f : fc) {
            votingDistrictFeaturesByName.put(f.getProperty(GEO_ID_PROPERTY), f);
            VotingDistrict vd = new VotingDistrict();
            vd.setName(f.getProperty(GEO_ID_PROPERTY));
            vd.setParentCongressionalDistrictName(f.getProperty(CD_PROPERTY));
            vd.setNeighbors(new HashMap<>());
            vd.setOnBorder(f.getProperty(ONBORDER_PROPERTY));
            vd.setResident(f.getProperty(RESIDENT_PROPERTY));
            vd.setDisplayName(f.getProperty(DISPLAY_NAME_PROPERTY));
            vd.setArea(f.getProperty(AREA_PROPERTY));
            vd.setPerimeter(f.getProperty(PERIMETER_PROPERTY));
            vd.setResident(false);
            vd.setFrozen(false);
            vd.setStatistic(new Statistic(
                    f.getProperty(TOTALPOP_PROPERTY),
                    f.getProperty(DEMOCRATIC_PROPERTY),
                    f.getProperty(REPUBLICAN_PROPERTY),
                    f.getProperty(THIRDPARTY_PROPERTY),
                    f.getProperty(WHITE_PROPERTY),
                    f.getProperty(BLACK_PROPERTY),
                    f.getProperty(ASIAN_PROPERTY),
                    f.getProperty(NATIVEAMERICAN_PROPERTY),
                    f.getProperty(PACIFICISLANDER_PROPERTY),
                    f.getProperty(TWOORMORE_PROPERTY)
            ));

            //TODO: Other fields here
            votingDistrictsByName.put(vd.getName(), vd);
            neighborsByName.put(vd.getName(), f.getProperty(NEIGHBORS_PROPERTY));
        }

    }

    public void populateNeighbors() {
        //populate neighbor list
        for (VotingDistrict vd : votingDistrictsByName.values()) {
            if (neighborsByName.containsKey(vd.getName())) {
                for (Object neighborName : ((LinkedHashMap) neighborsByName.get(vd.getName())).keySet()) {
                    String neighborNameString = (String)neighborName;
                    //System.out.println("NeighborID: " + neighborNameString);
                    double value = 0;
                    try {
                        value = (double)((LinkedHashMap) neighborsByName.get(vd.getName())).get(neighborName);
                    }
                    catch(Exception e){
                        value = (int)((LinkedHashMap) neighborsByName.get(vd.getName())).get(neighborName);
                    }
                    vd.getNeighbors().put(votingDistrictsByName.get(neighborNameString), value);
                }
            } else {
                System.out.println(vd.getName());
            }
        }
    }

    public void generateState(String stateName) {
        FeatureCollection fcVotingDistricts = defaultVotingDistrictFeaturesByStateName.get(stateName);

        // get unique CD id's
        List<String> distinctCongressionalDistrictNames = fcVotingDistricts.getFeatures()
                        .stream()
                        .filter(distinctByKey(vd -> vd.getProperty(CD_PROPERTY)))
                        .map(vd -> (String)vd.getProperty(CD_PROPERTY))
                        .collect(Collectors.toList());

        List<CongressionalDistrict> congressionalDistricts = new ArrayList<>();

        // create CD objects and populate their VD lists
        for (String s : distinctCongressionalDistrictNames) {
            CongressionalDistrict cd = new CongressionalDistrict(new ArrayList<>(), new ArrayList<>(), Area.DEFAULT_AREA, Area.DEFAULT_PERIM, Area.DEFAULT_SCORE, false);
            List<VotingDistrict> vdInCd = votingDistrictsByName.values()
                    .stream()
                    .filter(vd -> vd.getParentCongressionalDistrictName().equals(s))
                    .collect(Collectors.toList());
            cd.setVotingDistricts(new ArrayList<>(vdInCd));
            List<VotingDistrict> vdOnBorder = vdInCd
                    .stream()
                    .filter(vd -> vd.isOnBorder())
                    .collect(Collectors.toList());
            cd.setBorderDistricts(vdOnBorder);
            cd.setName(s);
            Statistic cdStat = new Statistic();
            for(VotingDistrict vd: cd.getVotingDistricts()) {
                cdStat.addStat(vd.getStatistic());
                cd.setArea(cd.getArea() + vd.getArea());
            }
            cd.setStatistic(cdStat);

            congressionalDistricts.add(cd);
            congressionalDistrictsByName.put(cd.getName(), cd);
        }

        for(VotingDistrict vd: votingDistrictsByName.values()){
            vd.setParentCongressionalDistrict(congressionalDistrictsByName.get(vd.getParentCongressionalDistrictName()));
        }
        for(CongressionalDistrict cd : congressionalDistricts){
            cd.calcPerim();
        }

        State state = new State();
        state.setName(stateName);
        state.setCongressionalDistricts(congressionalDistricts);

        Statistic sStat = new Statistic();
        for(CongressionalDistrict cd: state.getCongressionalDistricts()) {
            sStat.addStat(cd.getStatistic());
        }
        state.setStatistic(sStat);

        statesByName.put(state.getName(), state);
    }

    public void setFeatureStats(Feature f, Area a){
        f.getProperties().put("pop", a.getStatistic().getTotalPopulation());
        f.getProperties().put("dem", a.getStatistic().getDemocraticPartyPopulation());
        f.getProperties().put("gop", a.getStatistic().getRepublicanPartyPopulation());
        f.getProperties().put("thd", a.getStatistic().getThirdPartyPopulation());
        f.getProperties().put("wa", a.getStatistic().getWhitePopulation());
        f.getProperties().put("ba", a.getStatistic().getBlackPopulation());
        f.getProperties().put("aa", a.getStatistic().getAsianPopulation());
        f.getProperties().put("na", a.getStatistic().getNativeAmericanAlaskanPopulation());
        f.getProperties().put("ia", a.getStatistic().getPacificIslanderHawaiinPopulation());
        f.getProperties().put("tom", a.getStatistic().getTwoOrMoreRacePopulation());
    }




    public <T> Predicate<T> distinctByKey(Function<? super T, Object> keyExtractor) {
        Map<Object, Boolean> map = new ConcurrentHashMap<>();
        return t -> map.putIfAbsent(keyExtractor.apply(t), Boolean.TRUE) == null;
    }
}
