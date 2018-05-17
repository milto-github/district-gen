package com.districtgen.districtgen.controller;

import com.districtgen.districtgen.entity.MeasurementProfile;
import com.districtgen.districtgen.entity.Statistic;
import com.districtgen.districtgen.service.AreaService;
import org.geojson.FeatureCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(value = "/area")
public class AreaController {
    @Autowired
    private AreaService areaService;

    /**
     * Get the DEFAULT voting district -> congressional district id mappings
     */
    @RequestMapping(value = "/defaultVotingDistricts/{stateId}", method = RequestMethod.GET)
    public Map<String, String> getDefaultVotingDistricts(@PathVariable("stateId") String stateId) {
        return areaService.getDefaultVotingDistricts(stateId);
    }

    /**
     * Get the voting district -> congressional district id mappings
     */
    @RequestMapping(value = "/votingDistricts", method = RequestMethod.GET)
    public Map<String, String> getVotingDistricts(HttpServletRequest request) {
        return areaService.getVotingDistricts(request);
    }

    /**
     * Get the default feature collections for a state
     * To be initially used when loading the map on the frontend.
     */
    @RequestMapping(value = "/defaultStateFeatureCollection/{stateId}", method = RequestMethod.GET)
    public FeatureCollection getDefaultStateFeatureCollection(@PathVariable("stateId") String stateId) {
        return areaService.getDefaultStateFeatureCollection(stateId);
    }

    /**
     * Get the actual features in geojson format
     * It is used for exporting the featurecollection as a geojson file in the frontend.
     */
    @RequestMapping(value = "/getFeatureCollection", method = RequestMethod.GET)
    public FeatureCollection getFeatureCollection(HttpServletRequest request) {
        return areaService.getFeatureCollection(request);
    }

    @RequestMapping(value = "/setMeasurementProfile/{stateId}", method = RequestMethod.POST)
    public void setMeasurementProfile(@PathVariable("stateId") String stateId, @RequestBody MeasurementProfile mp, HttpServletRequest request){
        areaService.setMeasurementProfile(stateId, mp, request);
    }

    @RequestMapping(value = "/togglePause")
    public void togglePause(HttpServletRequest request) {
        areaService.togglePause(request);
    }

    @RequestMapping(value = "/terminate")
    public Map<String, String> terminateAlgorithm(HttpServletRequest request) {
        return areaService.terminateAlgorithm(request);
    }

    @RequestMapping(value = "/toggleFreeze/{id}")
    public void toggleFreeze(@PathVariable String id, HttpServletRequest request) {
        areaService.toggleFreeze(id, request);
    }

    @RequestMapping(value = "/webStats")
    public Map<String, Integer> webStats() {
        return areaService.webStats();
    }

    @RequestMapping(value = "/saveCurrentConfig")
    public long saveConfiguration(HttpServletRequest request) {
        return areaService.saveConfiguration(request);
    }

    @RequestMapping(value = "/cdStats")
    public Map<String, Statistic> cdStats(HttpServletRequest request) {
        return areaService.cdStats(request);
    }

    @RequestMapping(value = "/scores")
    public Map<String, Double> getScores(HttpServletRequest request) {
        return  areaService.getScores(request);
    }

    @RequestMapping(value = "/defaultStats")
    public Map<String, Statistic> getDefaultStats(HttpServletRequest request) {
        return areaService.getDefaultStats(request);
    }

    @RequestMapping("/deleteMeasurementProfile/{id}")
    public String deleteMeasurementProfile(@PathVariable String id, HttpServletRequest request) {
        return areaService.deleteMeasurementProfile(id, request);
    }

    @RequestMapping("/loadConfig/{id}")
    public Map<String, String> loadConfig(@PathVariable String id, HttpServletRequest request) {
        return areaService.loadConfig(id, request);
    }

    @RequestMapping(value = "/isFinished")
    public boolean isFinished(HttpServletRequest request) {
        return areaService.isFinished(request);
    }

    @RequestMapping(value = "/freezeDistrict/{id}")
    public void freezeDistrict(@PathVariable String id, HttpServletRequest request) {
        areaService.freezeDistrict(id, true, request);
    }

        @RequestMapping(value = "/unfreezeDistrict/{id}")
    public void unfreezeDistrict(@PathVariable String id, HttpServletRequest request) {
        areaService.freezeDistrict(id, false, request);
    }

    @RequestMapping(value = "/congressIds")
    public Map<String, List<String>> getCongressIds(HttpServletRequest request) {
        return areaService.getCongressIds();
    }



}

