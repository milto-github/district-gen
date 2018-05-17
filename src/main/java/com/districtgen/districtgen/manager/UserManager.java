package com.districtgen.districtgen.manager;

import com.districtgen.districtgen.entity.MeasurementProfile;
import com.districtgen.districtgen.entity.User;
import com.districtgen.districtgen.repository.UserRepository;
import com.districtgen.districtgen.service.AreaService;
import com.districtgen.districtgen.utility.Algorithm;
import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Component
@Getter
@Setter

public class UserManager {
    @Autowired
    private AreaService areaService;

    @Autowired
    private UserRepository userRepository;

    private BiMap<String, User> users;
    private HashMap<User, Algorithm> userAlgorithmMap;
    private SessionRegistry sessionRegistry;

    public UserManager() {
        sessionRegistry = sessionRegistry();
        users = HashBiMap.create();
        userAlgorithmMap = new HashMap<>();
    }

    public void addUser(String sessionID, User au) {
        users.put(sessionID, au);
    }

    public User getUserIdByRequest(HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        return users.get(sessionId);
    }

    public void removeUser(HttpServletRequest requestd) {
        String requestedSessionId = requestd.getSession().getId();
        users.remove(requestedSessionId);
    }

    @PostConstruct
    public void demoDB() {
        User admin1 = new User();
        User user1 = new User();

        MeasurementProfile mp = new MeasurementProfile(0, 0,
                0, 0);
        MeasurementProfile mpJoe = new MeasurementProfile(0, 0,
                0, 0);

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        admin1.setUsername("admin1");
        admin1.setEmail("admin1@stonybrook.edu");
        admin1.setPassword(encoder.encode("admin1pw"));
        admin1.setRole("ADMIN");
     //   admin1.setActiveMeasurementProfile(mpJoe);

        user1.setUsername("user1");
        user1.setEmail("user1@stonybrook.edu");
        user1.setPassword(encoder.encode("user1pw"));
        user1.setRole("USER");
       // user1.setActiveMeasurementProfile(mp);

        userRepository.save(admin1);
        userRepository.save(user1);


        System.out.println("************" + userRepository.findById("user1").get().getPassword() + "************");
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
}
