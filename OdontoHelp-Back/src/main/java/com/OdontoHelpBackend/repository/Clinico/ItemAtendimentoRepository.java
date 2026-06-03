package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemAtendimentoRepository extends JpaRepository<ItemAtendimento, Long> {
}
