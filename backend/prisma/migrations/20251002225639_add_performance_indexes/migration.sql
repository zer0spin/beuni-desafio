-- CreateIndex
CREATE INDEX "colaboradores_organization_id_idx" ON "colaboradores"("organization_id");

-- CreateIndex
CREATE INDEX "colaboradores_organization_id_data_nascimento_idx" ON "colaboradores"("organization_id", "data_nascimento");

-- CreateIndex
CREATE INDEX "enderecos_cep_idx" ON "enderecos"("cep");

-- CreateIndex
CREATE INDEX "envios_brinde_ano_aniversario_idx" ON "envios_brinde"("ano_aniversario");

-- CreateIndex
CREATE INDEX "envios_brinde_status_idx" ON "envios_brinde"("status");

-- CreateIndex
CREATE INDEX "envios_brinde_colaborador_id_idx" ON "envios_brinde"("colaborador_id");
