package com.districtgen.districtgen.entity;

import lombok.*;

import javax.persistence.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@ToString

@MappedSuperclass
public abstract class Area {
    @Id @GeneratedValue
    private long id;
    private String name;
    @Embedded
    private Statistic statistic;
    @Transient
    public static final double DEFAULT_SCORE = 0.0;
    public static final double DEFAULT_AREA = 0.0;
    public static final double DEFAULT_PERIM = 0.0;
}
