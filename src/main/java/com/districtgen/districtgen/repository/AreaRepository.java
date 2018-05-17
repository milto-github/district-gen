package com.districtgen.districtgen.repository;

import com.districtgen.districtgen.entity.Area;
import com.districtgen.districtgen.entity.MeasurementProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRepository extends JpaRepository<Area, String> {

}
