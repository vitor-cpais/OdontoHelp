package com.OdontoHelp.BackEnd.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (!username.equals("nero")) {
            throw new UsernameNotFoundException("USUARIO NÃO ENCONTRADO");
        }
        return User
                .builder()
                .username("nero")
                .password(encoder().encode("123")) // Usando o BCryptPasswordEncoder diretamente
                .roles("ADMIN")
                .build();
    }

    private PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }
}

