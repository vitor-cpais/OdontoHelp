package com.OdontoHelpBackend.infra.util;

public final class DadoSensivelUtil {

    private DadoSensivelUtil() {}

    public static String ocultarCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) return null;
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() < 11) return "***.***.***-**";
        return "***." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-**";
    }

    public static String ocultarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) return null;
        String digits = telefone.replaceAll("\\D", "");
        if (digits.length() < 10) return "(**) *****-****";
        String ddd = digits.substring(0, 2);
        String sufixo = digits.substring(digits.length() - 2);
        if (digits.length() == 11) {
            return "(" + ddd + ") " + digits.charAt(2) + "****-**" + sufixo;
        }
        return "(" + ddd + ") ****-**" + sufixo;
    }
}
