package com.districtgen.districtgen.utility;

import com.districtgen.districtgen.entity.CongressionalDistrict;
import com.districtgen.districtgen.entity.MeasurementProfile;
import com.districtgen.districtgen.entity.State;
import com.districtgen.districtgen.entity.VotingDistrict;
import com.districtgen.districtgen.manager.AreaManager;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static java.lang.Thread.sleep;
import java.util.Properties;

@Getter @Setter
public class Algorithm implements Runnable {
    private State currState;
    private State bestState;
    private MeasurementProfile measurementProfile;

    private boolean alive;
    private boolean paused;
    private boolean finished;

    private ReentrantLock lock;
    private final static Logger LOGGER = Logger.getLogger(Algorithm.class.getName());

    public Algorithm(State state, MeasurementProfile mp) {
        this.currState = state;
        this.bestState = state;
        this.measurementProfile = mp;
        this.alive = true;
        this.paused = false;
        this.finished = false;
        this.lock = new ReentrantLock();
        loadProperties();
    }

    private void loadProperties(){
        Properties prop = new Properties();
        InputStream input = null;
        try {
            input = new FileInputStream("config.properties");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            prop.load(input);
            initialCoolingRate = Double.parseDouble(prop.getProperty("initialCoolingRate"));
            rewardCoolingRate = Double.parseDouble(prop.getProperty("rewardCoolingRate"));
            penaltyCoolingRate = Double.parseDouble(prop.getProperty("penaltyCoolingRate"));
            initialTemp = Double.parseDouble(prop.getProperty("initialTemp"));
            stoppingCondition = Double.parseDouble(prop.getProperty("stoppingCondition"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        startRedistrict();
    }

    public State getProgress(){
        return currState;
    }

    // TODO: Implement this method
    public List<String> generateResult(){
        return null;
    }

    // Cooling rate
    static double initialCoolingRate = 0.10;
    static double rewardCoolingRate = 0.0;
    static double penaltyCoolingRate = .000;
    // This is a random value for now, don't know what a good value actually is
    private double initialTemp = 15;
    private double stoppingCondition = 1;

    public void startRedistrict(){
        currState.setTemp(initialTemp);
        currState.setCoolingRate(initialCoolingRate);
        currState.calcScore(measurementProfile);
        bestState = currState;
        solve(currState);
        setFinished(true);
        LOGGER.info("Finished Algorithm!");
    }

    /***
     * - Make coolingRate dynamic as an attribute of each state object
     * by decreasing coolingRate for good moves, and increasing for bad moves
     * - Start prematurly backtracking based on difference between bestState
     * - Check whether energies(scores) should be proportional to the temperature
     */

    private void solve(State state) {
        try {
            // Method to wait if we are paused and terminate if we are told to stop
            if (checkStopPause()) {
                return;
            }
            if (state.getScore() > bestState.getScore()) {
                lock.lock();
                try {
                    bestState = state.clone();
                } finally {
                    lock.unlock();
                }
                measurementProfile.setBestState(bestState);
            }
            if (state.getTemp() < stoppingCondition) {
                return;
            }
            //LOGGER.info("Solving Algorithm");
            State nextState;
            lock.lock();
            try {
                nextState = state.clone();
            } finally {
                lock.unlock();
            }
            currState = state; //Sets the current state which will be referenced by getProgress
            measurementProfile.setCurrState(currState);
            /***
             * This May be a naive way of picking candidates because it does not actually give
             * a way of rewarding adding certain voting districts if they make the score
             * better, just allows it to continue for at least one more iteration.
             * This algorithm is just a simple way to iterate over all possibilities of combinations
             * of voting districts. In the future a better candidate selection method may improve
             * the ultimate outcome.
             ***/
            List<VotingDistrict> candidates = new ArrayList<>(new HashSet<>(nextState.getCandidates())); //Get the valid voting districts which can be used in the next iteration
            for (VotingDistrict v : candidates) { //For each of those voting districts
                //LOGGER.info("Checking allowed to move");
                if (v.allowedToMove()) { //If the voting district is valid (i.e. keeps contiguity, or doesn't house the congress person)
                    lock.lock();
                    try {
                        v.moveVotingDistrict();
                        nextState.calcScore(measurementProfile); //Calculates and sets current scoring for the state
                    } finally {
                        lock.unlock();
                    }
                    if (acceptanceProbability(nextState, state.getScore(), nextState.getScore()) > Math.random()) {
                        lock.lock();
                        try {
                            nextState.setTemp(nextState.getTemp() * (1 - nextState.getCoolingRate()));
                        } finally {
                            lock.unlock();
                        }
                        solve(nextState);
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.info("An Error Occurred when running the Algorithm!");
            LOGGER.info(e.toString());
            return;
        }
    }

    public static double acceptanceProbability(State state, double oldScore, double newScore) {
        if (newScore > oldScore) { // New Score is better (larger)
            double rate = state.getCoolingRate() - rewardCoolingRate < 0 ? 0 : state.getCoolingRate() - rewardCoolingRate;
            state.setCoolingRate(rate);
            return 1.0;
        }
        // else newScore is worse (smaller)
        state.setCoolingRate(state.getCoolingRate() + penaltyCoolingRate);
        return Math.exp((oldScore - newScore) / state.getTemp());
    }

    private boolean checkStopPause(){
        if(!alive){
            return true;
        }
        boolean gotPaused = false;
        if(paused){
            LOGGER.info("Pausing Algorithm");
            gotPaused = true;
        }
        while(paused){
            if(!alive){
                return true;
            }
        }
        if(gotPaused) {
            LOGGER.info("Resuming Algorithm");
        }
        return false;
    }
}
