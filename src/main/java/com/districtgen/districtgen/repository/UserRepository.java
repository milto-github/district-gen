package com.districtgen.districtgen.repository;

import com.districtgen.districtgen.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.Optional;

@Repository
@Transactional
public interface UserRepository extends JpaRepository <User, String> {
    Optional<User> findByUsername(String username);
    @Modifying
    @Query(value = "INSERT INTO user_measurement_profile_history VALUES (:username, :id)", nativeQuery = true)
    void insertIntoHistory(@Param("username")String username, @Param("id")long id);
}
