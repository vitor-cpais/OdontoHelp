package br.com.odontohelp.fiscal.tenant;

import br.com.odontohelp.fiscal.config.JwtAuthFilter;
import br.com.odontohelp.fiscal.exception.AcessoNegadoException;
import jakarta.servlet.http.HttpServletRequest;

public final class TenantResolver {

    private TenantResolver() {}

    public static String resolver(HttpServletRequest request, String tenantIdInformado) {
        Object claimTenant = request.getAttribute(JwtAuthFilter.ATTR_TENANT_ID);
        String tenantDoToken = claimTenant instanceof String s && !s.isBlank() ? s.trim() : null;
        String tenantInformado = tenantIdInformado != null && !tenantIdInformado.isBlank()
                ? tenantIdInformado.trim()
                : null;

        if (tenantDoToken != null) {
            if (tenantInformado != null && !tenantInformado.equals(tenantDoToken)) {
                throw new AcessoNegadoException("tenantId nao corresponde ao token JWT");
            }
            return tenantDoToken;
        }
        if (tenantInformado == null) {
            throw new IllegalArgumentException("tenantId e obrigatorio");
        }
        return tenantInformado;
    }
}
