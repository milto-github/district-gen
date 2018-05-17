package com.districtgen.districtgen.entity;

import lombok.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString

@Entity
public class CongressionalDistrict extends Area {
    @OneToMany(cascade = CascadeType.ALL)
    private List<VotingDistrict> votingDistricts;
    @Transient
    private List<VotingDistrict> borderDistricts;
    @Transient
    private double perimeter;
    @Transient
    private double area;
    private double score;
    @Transient
    private boolean frozen;

    public CongressionalDistrict clone() {
        CongressionalDistrict cd = new CongressionalDistrict(new ArrayList<>(), new ArrayList<>(), perimeter, area, DEFAULT_SCORE, frozen);
        cd.setName(getName());
        cd.setStatistic(getStatistic().clone());
        for(VotingDistrict v : votingDistricts){
            VotingDistrict newVd = v.clone(cd);
            cd.getVotingDistricts().add(newVd);
        }
        for(VotingDistrict v : cd.getVotingDistricts()){
            if(v.isOnBorder()){
                cd.getBorderDistricts().add(v);
            }
        }
        return cd;
    }

    public boolean isContiguousWithoutDistrict(VotingDistrict v){
        HashMap<VotingDistrict, Boolean> nodes = new HashMap<>();
        votingDistricts.forEach(p -> nodes.put(p, false));
        nodes.remove(v);
        boolean isConnected = isConnected(nodes);
        return isConnected;
    }

    public boolean isConnected(HashMap<VotingDistrict, Boolean> nodes){
        try {
            dfs(nodes, nodes.entrySet().iterator().next().getKey());
        }
        catch(Exception e){
            e.printStackTrace();
        }
        return nodes.values().stream().filter(value -> value == false).findFirst().orElse(true);
    }

    public void dfs(HashMap<VotingDistrict, Boolean> nodes, VotingDistrict currNode){
        try{
            nodes.put(currNode, true);
            currNode.getNeighbors().keySet().forEach(n -> {
                if(nodes.keySet().contains(n) && !nodes.get(n)){
                    dfs(nodes, n);
                }});
        }
        catch(StackOverflowError e){
            e.printStackTrace();
        }
    }

    public double getUpdatedScore(MeasurementProfile mp, State state){
        calcScore(mp, state);
        return getScore();
    }

    public void calcPerim(){
        double perim = 0;
        for(VotingDistrict vd : votingDistricts){
            perim += vd.getPerimeter();
            for(VotingDistrict neighbor : vd.getNeighbors().keySet()){
                if(neighbor.getParentCongressionalDistrict().equals(this)){
                    perim -= vd.getNeighbors().get(neighbor);
                }
            }
        }
        setPerimeter(perim);
    }

    public void calcScore(MeasurementProfile mp, State state){
        double popDist = calcPopulationDistribution(state);
        double comp = calcCompactness();
        double partFair = calcPartisanFairness(state);
        double racialFair = calcRacialFairness(state);

        score =  ((mp.getCompactnessWeight()*comp +
                 mp.getPartisanFairnessWeight()*partFair +
                 mp.getPopulationDistributionWeight()*popDist +
                 mp.getRacialFairnessWeight()*racialFair)/mp.maxScore())*100;
    }

    // TODO: Need to implement these scoring methods
    private double calcRacialFairness(State state) {
        return getStatistic().racialScore(state);
    }

    private double calcPopulationDistribution(State state) {
        return getStatistic().populationScore(state);
    }

    private double calcPartisanFairness(State state) {
        return getStatistic().partisanScore(state);
    }

    private double calcCompactness() {
        double polsPop = ((4*Math.PI*getArea())/Math.pow(getPerimeter(), 2)); //Polsby-Popper
        double schwartz = 1/(getPerimeter()/(2*Math.PI*Math.pow((getArea()/Math.PI), .5)));
        //DCM is Digital Compactness Measure: Ratio of longest line in the shape to the area
        int factors = 2;
        return (polsPop + schwartz)/factors;
    }


    public void moveVotingDistrict(CongressionalDistrict cd, VotingDistrict v){
        removeDistrict(v);
        cd.addDistrict(v);
    }

    public void addDistrict(VotingDistrict v){
        borderDistricts.add(v);
        votingDistricts.add(v);
        getStatistic().addStat(v.getStatistic());
        addPerim(v);
    }

    public void removeDistrict(VotingDistrict v){
        borderDistricts.remove(v);
        votingDistricts.remove(v);
        getStatistic().subStat(v.getStatistic());
        subPerim(v);
    }

    public void addPerim(VotingDistrict v){
        double perim = getPerimeter() + v.getPerimeter();
        for(VotingDistrict vd : v.getNeighbors().keySet()){
            if(vd.getParentCongressionalDistrict().equals(this)){
                perim -= v.getNeighbors().get(vd);
            }
        }
        setPerimeter(perim);
    }

    public void subPerim(VotingDistrict v){
        double perim = getPerimeter() - v.getPerimeter();
        for(VotingDistrict vd : v.getNeighbors().keySet()){
            if(vd.getParentCongressionalDistrict().equals(this)){
                perim += v.getNeighbors().get(vd);
            }
        }
        setPerimeter(perim);
    }

}
