package com.districtgen.districtgen.service;

import com.districtgen.districtgen.entity.*;
import com.districtgen.districtgen.manager.AreaManager;
import com.districtgen.districtgen.manager.UserManager;
import com.districtgen.districtgen.utility.Algorithm;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.geojson.Feature;
import org.geojson.FeatureCollection;
import org.python.antlr.ast.Str;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;

import static lombok.AccessLevel.PRIVATE;

@Getter
@FieldDefaults(level = PRIVATE)

@Service
@Transactional
public class AreaService {
    @Autowired
    private AreaManager areaManager;
    @Autowired
    private UserManager userManager;

    private final static Logger LOGGER = Logger.getLogger(AreaService.class.getName());

    public Map<String, String> stateToVdCdMap(State state) {
        Map<String, String> vdCdMap = new HashMap<>();
        state.getCongressionalDistricts()
                .forEach(cd -> cd.getVotingDistricts()
                        .forEach(vd -> vdCdMap.put(vd.getName(), vd.getParentCongressionalDistrictName())));
        return vdCdMap;
    }

    public Map<String, String> getDefaultVotingDistricts(String stateName) {
        State state = areaManager.getStatesByName().get(stateName);
        return stateToVdCdMap(state);
    }

    public Map<String, String> getVotingDistricts(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        Map<String, String> vdCdMap;
        ReentrantLock lock = algo.getLock();
        lock.lock();
        try {
            State state = null;
            if(algo.isFinished()){
                state = algo.getBestState();
            }
            else {
                state = algo.getCurrState();
            }
            vdCdMap = stateToVdCdMap(state);
        } finally {
            lock.unlock();
        }
        return vdCdMap;
    }

    public FeatureCollection getDefaultStateFeatureCollection(String stateName) {
        return areaManager.getDefaultVotingDistrictFeaturesByStateName().get(stateName);
    }

    public FeatureCollection getFeatureCollection(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        State state = algo.getCurrState();
        FeatureCollection fc = new FeatureCollection();
        ReentrantLock lock = algo.getLock();
        lock.lock();
        try {
            for (CongressionalDistrict cd : state.getCongressionalDistricts()) {
                for (VotingDistrict vd : cd.getVotingDistricts()) {
                    String name = vd.getName();
                    Feature f = areaManager.getVotingDistrictFeaturesByName().get(name);
                    f.setProperty(areaManager.getCD_PROPERTY(), cd.getName());
                    areaManager.setFeatureStats(f, cd);
                    fc.add(f);
                }
            }
        } finally {
            lock.unlock();
        }
        LOGGER.info("Returning updated VotingDistricts");
        return fc;
    }

    public void setMeasurementProfile(String stateName, MeasurementProfile mp, HttpServletRequest request){
        User user = userManager.getUserIdByRequest(request);

        //the request should not be possible through the GUI
        if (userManager.getUserAlgorithmMap().containsKey(user)) {
            System.out.println("Only 1 thread per user.");
            // consider returning some message to the user
            return;
        }
        user.setActiveMeasurementProfile(mp);
        State state = areaManager.getStatesByName().get(stateName).clone();
        state.calcScore(mp);
        Algorithm algo = new Algorithm(state, mp);
        algo.setMeasurementProfile(mp);
        if (mp.getCurrState() == null) {
            mp.setCurrState(algo.getCurrState());
            mp.setBestState(algo.getBestState());
        } else {
            algo.setCurrState(mp.getCurrState());
            algo.setBestState(mp.getBestState());
        }
        algo.setPaused(true);
        algo.getBestState().calcScore(mp);
        userManager.getUserAlgorithmMap().put(user, algo);

        Thread thread = new Thread(algo);
        thread.start();
    }

    public void togglePause(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        algo.setPaused(!algo.isPaused());
        // other necessary flags or method calls here
    }

    public Map<String, String> terminateAlgorithm(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        algo.setFinished(true);
        Map<String, String> ret = getVotingDistricts(request);
        algo.setAlive(false);
        userManager.getUserAlgorithmMap().remove(user);
        return ret;
    }

    public void toggleFreeze(String name, HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        List<CongressionalDistrict> congressionalDistricts = algo.getCurrState().getCongressionalDistricts();
        for (CongressionalDistrict cd : congressionalDistricts) {
            for (VotingDistrict vd : cd.getVotingDistricts()) {
                if (vd.getName().equals(name)) {
                    vd.setFrozen(!vd.isFrozen());
                    return;
                }
            }
        }
    }

    public Map<String, Integer> webStats() {
        Map<String, Integer> webStats = new HashMap<>();
        int defaultCount = 0;

        webStats.put(areaManager.getVIRGINIA_ID(), defaultCount);
        webStats.put(areaManager.getWESTVIRGINIA_ID(), defaultCount);
        webStats.put(areaManager.getMARYLAND_ID(), defaultCount);

        userManager.getUserAlgorithmMap().values()
                .forEach(algo -> {
                    String name = algo.getCurrState().getName();
                    int count = webStats.get(name); 
                    webStats.put(name, ++count);
                });

        return webStats;
    }

    public long saveConfiguration(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);

        MeasurementProfile mp = algo.getMeasurementProfile();

        ReentrantLock lock = algo.getLock();
        long id = -1;
        lock.lock();
        try {
            MeasurementProfile clone = mp.clone();
            areaManager.getMeasurementProfileRepository().save(clone);
            user.getMeasurementProfileHistory().add(clone);
            id = clone.getId();
            String username = user.getUsername();
            userManager.getUserRepository().insertIntoHistory(username, id);
        } finally {
            lock.unlock();
        }

        return id;
    }

    public Map<String, String> loadConfig(String id, HttpServletRequest request) {
        Optional<MeasurementProfile> optionalMps =
                areaManager.getMeasurementProfileRepository().findById(Long.parseLong((id)));
        MeasurementProfile mp = optionalMps.get();
        User u = userManager.getUserIdByRequest(request);
        u.setActiveMeasurementProfile(mp);
        Algorithm algo = userManager.getUserAlgorithmMap().get(u);
        algo.setMeasurementProfile(mp);
        return stateToVdCdMap(mp.getBestState());
    }

    public String deleteMeasurementProfile(String id, HttpServletRequest request) {
        User u = userManager.getUserIdByRequest(request);
        long mpId = Long.parseLong(id);
        Optional<MeasurementProfile> optionalMps = areaManager.getMeasurementProfileRepository().findById(mpId);
//        optionalMps
//                .orElseThrow(() -> new IdNotFoundException("Username not found"));
        MeasurementProfile mp = optionalMps.get();
//                .map(MeasurementProfile::new).get();
        for (MeasurementProfile profile : u.getMeasurementProfileHistory()) {
            if (profile.getId() == mp.getId()) {
                u.getMeasurementProfileHistory().remove(profile);
                userManager.getUserRepository().save(u);
                break;
            }
        }
        areaManager.getMeasurementProfileRepository().deleteById(mpId);
        return "Success";
    }

    public Map<String, Statistic> cdStats(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);

        ReentrantLock lock = algo.getLock();
        lock.lock();
        try {
            Map<String, Statistic> cdStatMap = new HashMap();
            algo.getBestState().getCongressionalDistricts()
                    .stream()
                    .forEach(cd -> cdStatMap.put(cd.getName(), cd.getStatistic()));
            return cdStatMap;
        } finally {
            lock.unlock();
        }
    }

    public Map<String, Double> getScores(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);

        ReentrantLock lock = algo.getLock();
        lock.lock();
        try {
            Map<String, Double> areaScoreMap = new HashMap();
            State bestState = algo.getBestState();
            bestState.calcScore(algo.getMeasurementProfile());
            areaScoreMap.put(bestState.getName(), bestState.getScore());
            bestState.getCongressionalDistricts()
                    .stream()
                    .forEach(cd -> areaScoreMap.put(cd.getName(), cd.getScore()));
            return areaScoreMap;
        } finally {
            lock.unlock();
        }
    }

    public Map<String, Statistic> getDefaultStats(HttpServletRequest request) {
        Map<String, Statistic> defaultStatsMap = new HashMap<>();
        Map<String, State> statesByName = areaManager.getStatesByName();
        statesByName.keySet()
                .stream()
                .forEach(stateName -> {
                    State state = statesByName.get(stateName);
                    defaultStatsMap.put(stateName, state.getStatistic());
                    state.getCongressionalDistricts()
                            .stream()
                            .forEach(cd -> {
                                defaultStatsMap.put(cd.getName(), cd.getStatistic());
                            });
                });
        return defaultStatsMap;
    }

    public boolean isFinished(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        return algo.isFinished();
    }

    public void freezeDistrict(String name, boolean freeze, HttpServletRequest request){
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        List<CongressionalDistrict> congressionalDistricts = algo.getCurrState().getCongressionalDistricts();
        for (CongressionalDistrict cd : congressionalDistricts) {
            if(cd.getName().equals(name)){
                cd.setFrozen(true);
                for(VotingDistrict vd : cd.getVotingDistricts()){
                    vd.setFrozen(freeze);
                }
            }
        }

    }

    public Map<String, List<String>> getCongressIds(){
        HashMap<String, List<String>> ret = new HashMap<>();
        for(State s : areaManager.getStatesByName().values()){
            ArrayList<String> cdList = new ArrayList<>();
            for(CongressionalDistrict cd : s.getCongressionalDistricts()){
                cdList.add(cd.getName());
            }
            ret.put(s.getName(), cdList);
        }
        return ret;
    }

}
