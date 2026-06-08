package br.com.odontohelp.fiscal.provider.elotech;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "elotech",
        url = "${fiscal.elotech.url}",
        configuration = ElotechFeignConfig.class
)
public interface ElotechFeignClient {

    @PostMapping(
            value = "/nfse/recepcionarloterpsenviov3",
            consumes = "text/xml;charset=UTF-8",
            produces = "text/xml;charset=UTF-8"
    )
    String enviar(@RequestBody String envelopeSoap);
}
