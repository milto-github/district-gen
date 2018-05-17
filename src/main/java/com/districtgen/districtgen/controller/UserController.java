package com.districtgen.districtgen.controller;

import com.districtgen.districtgen.entity.MeasurementProfile;
import com.districtgen.districtgen.entity.User;
import com.districtgen.districtgen.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(value = "/user")
public class UserController {
    @Autowired
    private UserService userService;

    @RequestMapping("/login")
    public User login(HttpServletRequest request) {
        return userService.loginUser(request);
    }

    @RequestMapping("/logout")
    public String logout(HttpServletRequest request) {
        return userService.logoutUser(request);
    }

    @RequestMapping("/admin/getAllUsers")
    public List<User> getAllUsers(HttpServletRequest request){
        return userService.getAllUsers();
    }

    @RequestMapping(value = "/admin/deleteUserAccount", method = RequestMethod.POST)
    public String deleteUserAccount(@RequestBody String username){
        return userService.deleteUserAccount(username);
    }

    @RequestMapping("/editUser")
    public String editUserAccount(@RequestBody String[] info) {
        return userService.editUserAccount(info[0], info[1]);
    }

    @RequestMapping("/admin/editUser")
    public String editUserAccountAdmin(@RequestBody String[] info) {
        System.out.println("$$$$$$$$$$IN EDIT USER: CONTROLLER$$$$$$$$$$");
        return userService.editUserAccount(info[0], info[1]);
    }

    @RequestMapping("/register")
    public ResponseEntity<Void> createUser(@RequestBody User user){
        return userService.createUser(user);
    }

    @RequestMapping("/currentMeasurementProfile")
    public MeasurementProfile getCurrentMeasurementProfile(HttpServletRequest request){
        return userService.getCurrentMeasurementProfile(request);
    }

    @RequestMapping("/measurementProfileHistory")
    public List<MeasurementProfile> getMeasurementProfileHistory(HttpServletRequest request) {
        return userService.getMeasurementProfileHistory(request);
    }

    public String saveMeasurmentProfile(HttpServletRequest request){
        return null;
    }

    public String importMeasurmentProfile(HttpServletRequest request){
        return null;
    }

    public String exportMeasurmentProfile(HttpServletRequest request){
        return null;
    }

    public String updateUserAccount(HttpServletRequest request){
        return null;
    }

    public String getUserMeasurementsProfiles(HttpServletRequest request){
        return null;
    }

    public String getUserAccountInfo(HttpServletRequest request){
        return null;
    }

    public String getCurrentUserMeasurementProfile(HttpServletRequest request){
        return null;
    }

    public String deleteMeasurementProfile(HttpServletRequest request){
        return null;
    }

    public String getReport(HttpServletRequest request){
        return null;
    }

}
