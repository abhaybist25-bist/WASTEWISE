package com.wastewise;

import com.wastewise.auth.AuthResponse;
import com.wastewise.auth.AuthService;
import com.wastewise.auth.LoginRequest;
import com.wastewise.auth.RegisterRequest;
import com.wastewise.exception.BadRequestException;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.security.JwtTokenProvider;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.Role;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Chef Vikram", "donor@grandhotel.com", "encodedPassword", Role.ROLE_DONOR);
        sampleUser.setId("user-123");
    }

    @Test
    @DisplayName("Should successfully register a new donor")
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Chef Vikram");
        request.setEmail("donor@grandhotel.com");
        request.setPassword("Password@123");
        request.setRole(Role.ROLE_DONOR);
        request.setOrganizationName("Grand Palace");

        when(userRepository.existsByEmail("donor@grandhotel.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedSecretPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(organizationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateTokenFromUser(any(UserPrincipal.class))).thenReturn("mock-jwt-token");

        AuthResponse response = authService.registerUser(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("donor@grandhotel.com", response.getEmail());
        assertEquals(Role.ROLE_DONOR, response.getRole());
        verify(userRepository, atLeastOnce()).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegisterUser_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Another Chef");
        request.setEmail("donor@grandhotel.com");
        request.setPassword("Password@123");
        request.setRole(Role.ROLE_DONOR);

        when(userRepository.existsByEmail("donor@grandhotel.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should prevent user from self-assigning ROLE_ADMIN via public registration")
    void testRegisterUser_DisallowAdminRole() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Hacker");
        request.setEmail("hack@wastewise.org");
        request.setPassword("Password@123");
        request.setRole(Role.ROLE_ADMIN);

        when(userRepository.existsByEmail("hack@wastewise.org")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.registerUser(request));
    }

    @Test
    @DisplayName("Should authenticate user and return JWT token")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("donor@grandhotel.com", "Password@123");
        Authentication auth = mock(Authentication.class);
        UserPrincipal principal = UserPrincipal.create(sampleUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("login-jwt-token");
        when(auth.getPrincipal()).thenReturn(principal);
        when(userRepository.findById("user-123")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertEquals("login-jwt-token", response.getToken());
        assertEquals("donor@grandhotel.com", response.getEmail());
    }
}

