package com.districtgen.districtgen.service;


import com.districtgen.districtgen.entity.MeasurementProfile;
import com.districtgen.districtgen.entity.User;
import com.districtgen.districtgen.manager.UserManager;
import com.districtgen.districtgen.repository.UserRepository;
import com.districtgen.districtgen.utility.Algorithm;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import javax.mail.*;
import javax.mail.internet.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import javax.xml.ws.Response;
import java.nio.charset.Charset;
import java.util.*;

import static lombok.AccessLevel.PRIVATE;

@Getter
@FieldDefaults(level = PRIVATE)

@Service
@Transactional
public class UserService implements UserDetailsService {
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserRepository userRepository;

    private final String fromEmail = null;
    private final String emailPass = null;
    private final String subject = "Your verification password";

    public User loginUser(HttpServletRequest request) {
        User u = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("in loginUser: " + u.getUsername());
        userManager.getUsers().put(request.getSession().getId(), u);
        return u;
    }

    public String logoutUser(HttpServletRequest request) {
        try {
            request.logout();
            User user = userManager.getUserIdByRequest(request);
            userManager.removeUser(request);
            userManager.getUserAlgorithmMap().remove(user);
        } catch (ServletException e) {
            System.out.println("Could not logout user for some reason.");
            e.printStackTrace();
        }
        return "Logout Successful";
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users;
    }

    public ResponseEntity<Void> createUser(User user) {
        String password = randomPassword();

        if (userManager.getUserRepository().findByUsername(user.getUsername()).isPresent()) {
            return new ResponseEntity<>(HttpStatus.FOUND);
        }
        try {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            user.setPassword(encoder.encode(password));
            userManager.getUserRepository().save(user);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        String message = "Hello " + user.getEmail() + "! Your temporary password is: "
                + password + "\nYou can change this password after logging in. " +
                "We highly recommend you do so for security reasons. Thank you " +
                "for signing up!";
        String[] to = {user.getEmail()};
        sendFromGMail(fromEmail, emailPass, to, subject, message);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    public String editUserAccount(String username, String password) {
        Optional<User> optionalUsers = userManager.getUserRepository().findByUsername(username);

        optionalUsers
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        User u = optionalUsers.get();

        System.out.println(u.getDateCreated());

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        u.setPassword(encoder.encode(password));
        userRepository.save(u);
        return "Updated info";
    }

    public String deleteUserAccount(String id) {
        try {
            userManager.getUserRepository().deleteById(id);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to delete user: " + id +
                    "\n Reason: " + e.getMessage();
        }
        return "User: " + id + " deleted";
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> optionalUsers = userManager.getUserRepository().findByUsername(username);

        optionalUsers
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        User u = optionalUsers
                .map(User::new).get();

        u.setActiveMeasurementProfile(new MeasurementProfile(0,
                0,
                0,
                0));
        System.out.println("********" + u.toString() + "*********");
        return u;
    }

    public MeasurementProfile getCurrentMeasurementProfile(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        Algorithm algo = userManager.getUserAlgorithmMap().get(user);
        return algo.getMeasurementProfile();
    }

    public List<MeasurementProfile> getMeasurementProfileHistory(HttpServletRequest request) {
        User user = userManager.getUserIdByRequest(request);
        return user.getMeasurementProfileHistory();
    }



    public String randomPassword() {
        int leftLimit = 33; // letter 'a'
        int rightLimit = 125; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();
        StringBuilder buffer = new StringBuilder(targetStringLength);
        for (int i = 0; i < targetStringLength; i++) {
            int randomLimitedInt = leftLimit + (int)
                    (random.nextFloat() * (rightLimit - leftLimit + 1));
            buffer.append((char) randomLimitedInt);
        }
        String generatedString = buffer.toString();
        return generatedString;
    }



    private void sendFromGMail(String from, String pass, String[] to, String subject, String body) {
        Properties props = System.getProperties();
        String host = "smtp.gmail.com";
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.user", from);
        props.put("mail.smtp.password", pass);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");

        Session session = Session.getDefaultInstance(props);
        MimeMessage message = new MimeMessage(session);

        try {
            message.setFrom(new InternetAddress(from));
            InternetAddress[] toAddress = new InternetAddress[to.length];

            // To get the array of addresses
            for( int i = 0; i < to.length; i++ ) {
                toAddress[i] = new InternetAddress(to[i]);
            }

            for( int i = 0; i < toAddress.length; i++) {
                message.addRecipient(Message.RecipientType.TO, toAddress[i]);
            }

            message.setSubject(subject);
            message.setText(body);
            Transport transport = session.getTransport("smtp");
            transport.connect(host, from, pass);
            transport.sendMessage(message, message.getAllRecipients());
            transport.close();
        }
        catch (AddressException ae) {
            ae.printStackTrace();
        }
        catch (MessagingException me) {
            me.printStackTrace();
        }
    }
}
