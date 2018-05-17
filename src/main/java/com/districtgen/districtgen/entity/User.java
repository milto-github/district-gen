package com.districtgen.districtgen.entity;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class User implements UserDetails {
    @Id
    private String username;
    private String password;
    private String role;
    private String email;
    private Date dateCreated = new Date();
    @Transient
    private MeasurementProfile activeMeasurementProfile;
    @OneToMany(fetch = FetchType.LAZY)
    private List<MeasurementProfile> measurementProfileHistory;

    public User(User user) {
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.measurementProfileHistory = new ArrayList<>();
        this.dateCreated = new Date();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        ArrayList<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String toString() {
        return "User{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", dateCreated=" + dateCreated + '\'' +
                ", profileSize=" + measurementProfileHistory.size() +
                '}';
    }
}
