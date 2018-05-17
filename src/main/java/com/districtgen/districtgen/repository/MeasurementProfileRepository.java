package com.districtgen.districtgen.repository;

import com.districtgen.districtgen.entity.MeasurementProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeasurementProfileRepository extends JpaRepository<MeasurementProfile, String> {
    Optional<MeasurementProfile> findById(long id);
    void deleteById(long id);
}
