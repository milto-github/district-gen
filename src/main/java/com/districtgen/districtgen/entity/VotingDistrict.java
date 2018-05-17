package com.districtgen.districtgen.entity;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Transient;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

@Entity
public class VotingDistrict extends Area{
    @Transient
    private boolean resident;
    @Transient
    private boolean onBorder;
    @Transient
    private boolean frozen;
    @Transient
    private String displayName;
    @Transient
    private double area;
    @Transient
    private double perimeter;
    @Transient
    private HashMap<VotingDistrict, Double> neighbors;

    //TODO: fix this redundancy
    @Transient
    private CongressionalDistrict parentCongressionalDistrict;
    @Transient
    private String parentCongressionalDistrictName;

    public boolean hasNeighborInAnotherDistrict(){
        return getNeighbors().keySet().stream().filter(n -> !n.getParentCongressionalDistrict().equals(getParentCongressionalDistrict())
                && !n.getParentCongressionalDistrict().isFrozen()).findFirst().isPresent();
    }

    public CongressionalDistrict getNeighboringCongressionalDistrict(){
        return getNeighbors().keySet().stream().filter(n -> !n.getParentCongressionalDistrict().equals(getParentCongressionalDistrict()))
                .map(v -> v.getParentCongressionalDistrict()).findFirst().orElse(null);
    }

    public List<CongressionalDistrict> getNeighboringCongressionalDistricts(){
        return getNeighbors().keySet().stream()
                .filter(n -> !n.getParentCongressionalDistrict().equals(getParentCongressionalDistrict())) // Gets all voting districts with neighbors in different congressional districts
                .map(v -> v.getParentCongressionalDistrict()).distinct().collect(Collectors.toList()); // Maps those voting districts to their parent congressional Districts
    }

    public CongressionalDistrict moveVotingDistrict() {
        CongressionalDistrict moveTo = getNeighboringCongressionalDistrict();
        getParentCongressionalDistrict().moveVotingDistrict(moveTo, this);
        setParentCongressionalDistrict(moveTo);
        getNeighbors().keySet().forEach(n -> n.setOnBorder(n.hasNeighborInAnotherDistrict()));
        return moveTo;
    }

    public void moveVotingDistrict(CongressionalDistrict moveTo) {
        getParentCongressionalDistrict().moveVotingDistrict(moveTo, this);
        setParentCongressionalDistrict(moveTo);
        getNeighbors().keySet().forEach(n -> n.setOnBorder(n.hasNeighborInAnotherDistrict()));

    }

    public boolean allowedToMove() {
        return !isResident() && !isFrozen() && getParentCongressionalDistrict().getVotingDistricts().size() > 1 &&
                getParentCongressionalDistrict().isContiguousWithoutDistrict(this) &&
                hasNeighborInAnotherDistrict();
    }

    public VotingDistrict clone(CongressionalDistrict cd){
        VotingDistrict v =  new VotingDistrict(resident, onBorder, frozen, displayName, area, perimeter, new HashMap<>(), cd, cd.getName());
        v.setId(getId());
        v.setName(getName());
        v.setStatistic(getStatistic().clone());
        return v;
    }
}
