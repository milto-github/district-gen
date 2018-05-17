package com.districtgen.districtgen.entity;

import lombok.*;
import org.geojson.Feature;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Transient;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString

@Entity
public class State extends Area {
    @OneToMany(cascade = CascadeType.ALL)
    private List<CongressionalDistrict> congressionalDistricts;
    @Transient
    private double temp;
    @Transient
    private double coolingRate;
    private double score;

    public State clone(){
        State s = new State(new ArrayList<>(), temp, coolingRate, score);
        s.setName(getName());
        s.setStatistic(getStatistic().clone());
        HashMap<String, VotingDistrict> oldMap = new HashMap<>();
        HashMap<String, HashMap<VotingDistrict, Double>> oldNeighbors = new HashMap<>();
        HashMap<String, VotingDistrict> newMap = new HashMap<>();
        for(CongressionalDistrict cd : congressionalDistricts){
            for(VotingDistrict vd : cd.getVotingDistricts()){
                oldMap.put(vd.getName(), vd);
                oldNeighbors.put(vd.getName(), vd.getNeighbors());
            }
            CongressionalDistrict newDistrict = cd.clone();
            s.congressionalDistricts.add(newDistrict);
            for(VotingDistrict vd : newDistrict.getVotingDistricts()){
                newMap.put(vd.getName(), vd);
            }
        }
        // Setting up new neighbors for voting districts
        for(VotingDistrict vd : oldMap.values()){ // For all the old map values
            if(oldNeighbors.containsKey(vd.getName())){ //If the old neighborsmap has an entry for the current old Id (which it should)
                for(VotingDistrict neighbor : oldNeighbors.get(vd.getName()).keySet()){ //For each of these neighbors
                    newMap.get(vd.getName()).getNeighbors().put(newMap.get(neighbor.getName()), oldNeighbors.get(vd.getName()).get(neighbor)); //Get the new copy of the voting districts neighbor list and add the new copy of the neighbor
                }
            }
        }
        return s;
    }

    public List<VotingDistrict> getCandidates(){
        return getCongressionalDistricts().stream()
                .flatMap(a -> a.getBorderDistricts().stream())
                .collect(Collectors.toList());
    }

    public void calcScore(MeasurementProfile mp){
        score = getCongressionalDistricts().stream()
                .mapToDouble(cd -> cd.getUpdatedScore(mp, this)).average().orElse(0);
    }
}
