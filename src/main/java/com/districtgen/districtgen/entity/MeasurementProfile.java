package com.districtgen.districtgen.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@Getter @Setter
@ToString
@NoArgsConstructor

@Entity
public class MeasurementProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private Date dateCreated;
    private float compactnessWeight;
    private float partisanFairnessWeight;
    private float racialFairnessWeight;
    private float populationDistributionWeight;
    @OneToOne(cascade = CascadeType.ALL) @JsonIgnore
    private State currState;
    @OneToOne(cascade = CascadeType.ALL) @JsonIgnore
    private State bestState;

    public MeasurementProfile(float compactnessWeight, float partisanFairnessWeight,
                              float racialFairnessWeight, float populationDistributionWeight) {
        this.compactnessWeight = compactnessWeight;
        this.partisanFairnessWeight = partisanFairnessWeight;
        this.racialFairnessWeight = racialFairnessWeight;
        this.populationDistributionWeight = populationDistributionWeight;
        this.dateCreated = new Date();
    }

    public double maxScore(){
        return compactnessWeight + partisanFairnessWeight + racialFairnessWeight + populationDistributionWeight;
    }

    @Override
    public MeasurementProfile clone() {
        MeasurementProfile clone = new MeasurementProfile(compactnessWeight, partisanFairnessWeight, racialFairnessWeight, populationDistributionWeight);
        clone.setDateCreated(dateCreated);
        clone.setCurrState(currState.clone());
        clone.setBestState(bestState.clone());

        return clone;
    }
}
