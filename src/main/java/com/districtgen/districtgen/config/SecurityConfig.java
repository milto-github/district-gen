package com.districtgen.districtgen.config;

import com.districtgen.districtgen.manager.UserManager;
import com.districtgen.districtgen.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Autowired
    private UserManager userManager;

    @Autowired
    private UserService userService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .httpBasic().and()
                .authorizeRequests()
                .antMatchers("/h2-console/**").permitAll()
                .antMatchers("/console/**").permitAll()
                .antMatchers("/").permitAll()
                .antMatchers("/area/defaultVotingDistricts/**", "/index").permitAll()
                .antMatchers("/area/").hasAnyRole("USER", "ADMIN")
                .antMatchers("/user/accountinfo/**").hasAnyRole("USER", "ADMIN")
                .antMatchers("/user/login").hasAnyRole("USER", "ADMIN")
                .antMatchers("/user/logout").permitAll()
                .antMatchers("/user/admin/").hasRole("ADMIN");
        http
                .cors().configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues());
        http
                .sessionManagement().maximumSessions(10)
                .sessionRegistry(userManager.getSessionRegistry());
        http.csrf().disable()
                .headers().frameOptions().disable();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        BCryptPasswordEncoder encoder = passwordEncoder();

        auth.userDetailsService(userService)
                .passwordEncoder(encoder);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}

