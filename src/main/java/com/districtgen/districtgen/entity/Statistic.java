package com.districtgen.districtgen.entity;

import lombok.*;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString

@Embeddable
public class Statistic {
    private int totalPopulation;

    private int democraticPartyPopulation;
    private int republicanPartyPopulation;
    private int thirdPartyPopulation;

    private int whitePopulation;
    private int blackPopulation;
    private int asianPopulation;
    private int nativeAmericanAlaskanPopulation;
    private int pacificIslanderHawaiinPopulation;
    private int twoOrMoreRacePopulation;

    public Statistic clone(){
        return new Statistic(totalPopulation, democraticPartyPopulation,
                republicanPartyPopulation, thirdPartyPopulation,
                whitePopulation, blackPopulation, asianPopulation,
                nativeAmericanAlaskanPopulation, pacificIslanderHawaiinPopulation,
                twoOrMoreRacePopulation);
    }

    public double partisanScore(State state){
        int numDistricts = state.getCongressionalDistricts().size();
        Statistic stateStat = state.getStatistic();
        int factors = 3;
        double total = 0;
        total += normalizedScore(stateStat.republicanPartyPopulation/numDistricts, republicanPartyPopulation);
        total += normalizedScore(stateStat.democraticPartyPopulation/numDistricts, democraticPartyPopulation);
        total += normalizedScore(stateStat.thirdPartyPopulation/numDistricts, thirdPartyPopulation);
        return total/factors;
    }

    public double racialScore(State state){
        int numDistricts = state.getCongressionalDistricts().size();
        Statistic stateStat = state.getStatistic();
        int factors = 6;
        double total = 0;
        total += normalizedScore(stateStat.whitePopulation/numDistricts, whitePopulation);
        total += normalizedScore(stateStat.blackPopulation/numDistricts, blackPopulation);
        total += normalizedScore(stateStat.asianPopulation/numDistricts, asianPopulation);
        total += normalizedScore(stateStat.nativeAmericanAlaskanPopulation/numDistricts, nativeAmericanAlaskanPopulation);
        total += normalizedScore(stateStat.pacificIslanderHawaiinPopulation/numDistricts, pacificIslanderHawaiinPopulation);
        total += normalizedScore(stateStat.twoOrMoreRacePopulation/numDistricts, twoOrMoreRacePopulation);
        return total/factors;
    }

    public double populationScore(State state){
        int numDistricts = state.getCongressionalDistricts().size();
        Statistic stateStat = state.getStatistic();
        int factors = 1;
        double total = 0;
        total += normalizedScore(stateStat.totalPopulation/numDistricts, totalPopulation);
        return total/factors;
    }

    public double normalizedScore(double average, double actual){
        // 1-(Avg-actual)/Avg
        return 1-(Math.abs(average-actual)/average);
    }

    public void addStat(Statistic s){
        addTotalPopulation(s.getTotalPopulation());
        addDemocraticPartyPopulation(s.getDemocraticPartyPopulation());
        addRepublicanPartyPopulation(s.getRepublicanPartyPopulation());
        addThirdPartyPopulation(s.getThirdPartyPopulation());
        addWhitePopulation(s.getWhitePopulation());
        addBlackPopulation(s.getBlackPopulation());
        addAsianPopulation(s.getAsianPopulation());
        addNativeAmericanAlaskanPopulation(s.getNativeAmericanAlaskanPopulation());
        addPacificIslanderHawaiinPopulation(s.getPacificIslanderHawaiinPopulation());
        addTwoOrMoreRacePopulation(s.getTwoOrMoreRacePopulation());
    }

    public void subStat(Statistic s){
        subTotalPopulation(s.getTotalPopulation());
        subDemocraticPartyPopulation(s.getDemocraticPartyPopulation());
        subRepublicanPartyPopulation(s.getRepublicanPartyPopulation());
        subThirdPartyPopulation(s.getThirdPartyPopulation());
        subWhitePopulation(s.getWhitePopulation());
        subBlackPopulation(s.getBlackPopulation());
        subAsianPopulation(s.getAsianPopulation());
        subNativeAmericanAlaskanPopulation(s.getNativeAmericanAlaskanPopulation());
        subPacificIslanderHawaiinPopulation(s.getPacificIslanderHawaiinPopulation());
        subTwoOrMoreRacePopulation(s.getTwoOrMoreRacePopulation());
    }


    public void addTotalPopulation(int num){
        totalPopulation += num;
    }

    public void addDemocraticPartyPopulation(int num){
        democraticPartyPopulation += num;
    }

    public void addRepublicanPartyPopulation(int num){
        republicanPartyPopulation += num;
    }

    public void addThirdPartyPopulation(int num){
        thirdPartyPopulation += num;
    }

    public void addWhitePopulation(int num){
        whitePopulation += num;
    }

    public void addBlackPopulation(int num){
        blackPopulation += num;
    }

    public void addAsianPopulation(int num){
        asianPopulation += num;
    }

    public void addNativeAmericanAlaskanPopulation(int num){
        nativeAmericanAlaskanPopulation += num;
    }

    public void addPacificIslanderHawaiinPopulation(int num){
        pacificIslanderHawaiinPopulation += num;
    }

    public void addTwoOrMoreRacePopulation(int num){
        twoOrMoreRacePopulation += num;
    }

    public void subTotalPopulation(int num){
        totalPopulation -= num;
    }

    public void subDemocraticPartyPopulation(int num){
        democraticPartyPopulation -= num;
    }

    public void subRepublicanPartyPopulation(int num){
        republicanPartyPopulation -= num;
    }

    public void subThirdPartyPopulation(int num){
        thirdPartyPopulation -= num;
    }

    public void subWhitePopulation(int num){
        whitePopulation -= num;
    }

    public void subBlackPopulation(int num){
        blackPopulation -= num;
    }

    public void subAsianPopulation(int num){
        asianPopulation -= num;
    }

    public void subNativeAmericanAlaskanPopulation(int num){
        nativeAmericanAlaskanPopulation -= num;
    }

    public void subPacificIslanderHawaiinPopulation(int num){
        pacificIslanderHawaiinPopulation -= num;
    }

    public void subTwoOrMoreRacePopulation(int num){
        twoOrMoreRacePopulation -= num;
    }
}
