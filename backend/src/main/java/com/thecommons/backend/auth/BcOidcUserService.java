package com.thecommons.backend.auth;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class BcOidcUserService
        implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private static final String ALLOWED_DOMAIN = "bc.edu";

    private final OAuth2UserService<OidcUserRequest, OidcUser>
            googleOidcUserService;

    public BcOidcUserService() {
        this(new OidcUserService());
    }

    BcOidcUserService(
            OAuth2UserService<OidcUserRequest, OidcUser>
                    googleOidcUserService) {
        this.googleOidcUserService = googleOidcUserService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest)
            throws OAuth2AuthenticationException {
        OidcUser user = googleOidcUserService.loadUser(userRequest);

        Boolean emailVerified = user.getClaimAsBoolean("email_verified");
        String hostedDomain = user.getClaimAsString("hd");

        if (!Boolean.TRUE.equals(emailVerified)
                || !ALLOWED_DOMAIN.equals(hostedDomain)) {
            OAuth2Error error = new OAuth2Error(
                    "invalid_bc_account",
                    "A verified bc.edu Google account is required",
                    null);
            throw new OAuth2AuthenticationException(error);
        }

        return user;
    }
}
