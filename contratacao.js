document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // Elementos principais
  // ==============================
  const monthYearSpan = document.getElementById("month-year");
  const calendarDays = document.getElementById("calendar-days");
  const selectionContainer = document.getElementById("selection-cards-container");
  const totalHoursCard = document.getElementById("total-hours-card");
  const sectionSelecao = document.getElementById("section-selecao");
  const sectionConfirmacao = document.getElementById("section-confirmacao");
  const tabelaCorpo = document.getElementById("tabela-corpo");
  const tabelaConfirmacao = document.getElementById("tabela-confirmacao"); // Adicionado para html2canvas

  // Botões
  const btnPrevMonth = document.getElementById("prev-month");
  const btnNextMonth = document.getElementById("next-month");
  const btnVoltar = document.getElementById("btn-voltar");
  const btnAvancar = document.getElementById("btn-avancar");
  const btnEditar = document.getElementById("btn-editar");
  const btnRepetirAulas = document.getElementById("btn-repetir-aulas"); // Novo botão
  const btnEnviarCronograma = document.getElementById("btn-enviar-cronograma"); // Renomeado
  const btnBaixarCronograma = document.getElementById("btn-baixar-cronograma"); // Novo botão

  let selectedDays = [];
  let contadorAulas = 1;
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  let dataAtual = new Date();

  // ==============================
  // Função: renderizar calendário
  // ==============================
  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYearSpan.textContent = `${meses[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const lastDay = new Date(year, month + 1, 0).getDay();

    calendarDays.innerHTML = "";
    for (let i = 0; i < firstDay; i++) {
      calendarDays.appendChild(document.createElement("div"));
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;
      const dateKey = `${day}/${month + 1}/${year}`;
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0); // Zera a hora para comparação correta

      const isPastDay = currentDate < hoje;

      if (isPastDay) dayDiv.classList.add("past-day");
      if (selectedDays.includes(dateKey)) dayDiv.classList.add("selected-day");
      // Verifica se é o dia atual, mas apenas se não for um dia passado
      if (day === hoje.getDate() && month === hoje.getMonth() && year === hoje.getFullYear() && !isPastDay) {
        dayDiv.classList.add("today");
      }

      if (!isPastDay) {
        dayDiv.addEventListener("click", () => {
          if (!selectedDays.includes(dateKey)) {
            selectedDays.push(dateKey);
            criarCardSelecao(day, month, year, dateKey);
            dayDiv.classList.add("selected-day");
          }
        });
      }

      calendarDays.appendChild(dayDiv);
    }

    // Preenche os dias restantes da última semana para completar o grid
    const totalCells = firstDay + totalDays;
    const remainingCells = (7 - (totalCells % 7)) % 7; // Calcula quantos divs vazios faltam para completar a última linha
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.appendChild(document.createElement("div"));
    }
  }

  renderCalendar(dataAtual);

  // ==============================
  // Navegação entre meses
  // ==============================
  btnPrevMonth.addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderCalendar(dataAtual);
  });

  btnNextMonth.addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderCalendar(dataAtual);
  });

  // ==============================
  // Criar Card de Seleção
  // ==============================
  function criarCardSelecao(dia, mes, ano, dateKey) {
    const card = document.createElement('div');
    card.classList.add('selection-card');
    const dataCompleta = new Date(ano, mes, dia);
    const nomeDiaSemana = diasDaSemana[dataCompleta.getDay()];
    const dataFormatada = `${nomeDiaSemana} - ${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;

    card.innerHTML = `
      <strong>Aula ${String(contadorAulas).padStart(2, '0')}</strong>
      <strong>Data:</strong> ${dataFormatada}
      <label>Matéria:</label>
      <select class="select-materia">
        <option value="">Selecione</option>
        <option value="Biologia">Biologia</option>
        <option value="Ciências">Ciências</option>
        <option value="Filosofia">Filosofia</option>
        <option value="Física">Física</option>
        <option value="Geografia">Geografia</option>
        <option value="História">História</option>
        <option value="Língua Inglesa">Língua Inglesa</option>
        <option value="Língua Portuguesa">Língua Portuguesa</option>
        <option value="Matemática">Matemática</option>
        <option value="Química">Química</option>
        <option value="Sociologia">Sociologia</option>
      </select>

      <label>Horário:</label>
      <input type="time" class="input-time">

      <label>Duração:</label>
      <select class="select-duracao">
        <option value="">Selecione</option>
        <option>1h</option>
        <option>1h30</option>
        <option>2h</option>
        <option>2h30</option>
        <option>3h</option>
      </select>

      <button class="delete-btn">Deletar</button>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => {
      selectedDays = selectedDays.filter(day => day !== dateKey);
      renderCalendar(dataAtual);
      gsap.to(card, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
        card.remove();
        atualizarTotalHoras();
        // Reajusta o contador de aulas se necessário, ou apenas deixa ele crescer
        // Se precisar reordenar os números das aulas, uma função adicional seria necessária aqui
      }});
    });

    card.querySelector('.select-duracao').addEventListener('change', atualizarTotalHoras);
    selectionContainer.appendChild(card);

    gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
    contadorAulas++;
    atualizarTotalHoras();

    selectionContainer.scrollTo({
      top: selectionContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  // ==============================
  // Atualizar Total de Horas
  // ==============================
  function atualizarTotalHoras() {
    let totalMinutos = 0;
    document.querySelectorAll('.select-duracao').forEach(select => {
      const valor = select.value;
      if (valor) {
        if (valor.includes('h30')) {
          totalMinutos += parseInt(valor) * 60 + 30;
        } else {
          totalMinutos += parseInt(valor) * 60;
        }
      }
    });
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    totalHoursCard.textContent = `Total de horas: ${horas}h${String(minutos).padStart(2, '0')}`;
  }

  // ==============================
  // Animação inicial da Section Seleção
  // ==============================
  function animarEntradaSelecao() {
    gsap.fromTo("#calendar-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    gsap.fromTo("#total-hours-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
    gsap.fromTo("#selection-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4 });
  }

  animarEntradaSelecao();

  // ==============================
  // Evento: Avançar (Ir para Confirmação)
  // ==============================
  btnAvancar.addEventListener("click", () => {
    gerarTabelaConfirmacao();
    sectionSelecao.style.display = "none";
    sectionConfirmacao.style.display = "block";
    gsap.fromTo(sectionConfirmacao, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  });

  // ==============================
  // Evento: Editar dias de aula (Voltar para Seleção)
  // ==============================
  btnEditar.addEventListener("click", () => {
    sectionConfirmacao.style.display = "none";
    sectionSelecao.style.display = "block";
    animarEntradaSelecao();
  });

  // ==============================
  // Geração da Tabela de Confirmação
  // ==============================
  function gerarTabelaConfirmacao() {
    tabelaCorpo.innerHTML = ""; // Limpa a tabela
    const cards = document.querySelectorAll(".selection-card"); // Seleciona todos os cards
    cards.forEach(card => {
      // Captura a data formatada diretamente do texto do strong com "Data:"
      const dataText = card.querySelector("strong:nth-child(2)").nextSibling.textContent.trim();
      const horario = card.querySelector(".input-time").value || "Não informado";
      const duracao = card.querySelector(".select-duracao").value || "Não selecionado";
      const materia = card.querySelector(".select-materia").value || "Não selecionado";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dataText}</td>
        <td>${horario}</td>
        <td>${duracao}</td>
        <td>${materia}</td>
        <td>Professor (a definir)</td>
      `;
      tabelaCorpo.appendChild(tr);
    });
  }

  // ==============================
  // Novo Botão: Repetir mesma matéria e horários
  // ==============================
  btnRepetirAulas.addEventListener("click", () => {
    const allCards = document.querySelectorAll(".selection-card");
    if (allCards.length === 0) {
      alert("Adicione pelo menos uma aula para usar esta função.");
      return;
    }

    const firstCard = allCards[0];
    const firstCardTime = firstCard.querySelector(".input-time").value;
    const firstCardDuration = firstCard.querySelector(".select-duracao").value;
    const firstCardMateria = firstCard.querySelector(".select-materia").value;

    // Itera a partir do segundo card
    for (let i = 1; i < allCards.length; i++) {
      const currentCard = allCards[i];
      const currentTimeInput = currentCard.querySelector(".input-time");
      const currentDurationSelect = currentCard.querySelector(".select-duracao");
      const currentMateriaSelect = currentCard.querySelector(".select-materia");

      // Preenche Horário se estiver vazio
      if (!currentTimeInput.value && firstCardTime) {
        currentTimeInput.value = firstCardTime;
      }
      // Preenche Duração se estiver vazio
      if (!currentDurationSelect.value && firstCardDuration) {
        currentDurationSelect.value = firstCardDuration;
        atualizarTotalHoras(); // Atualiza o total de horas após preencher
      }
      // Preenche Matéria se estiver vazio
      if (!currentMateriaSelect.value && firstCardMateria) {
        currentMateriaSelect.value = firstCardMateria;
      }
    }
  });

  // ==============================
  // Botão: Enviar Cronograma (Compartilhar via WhatsApp)
  // ==============================
  btnEnviarCronograma.addEventListener("click", async () => {
    const message = encodeURIComponent("Olá Masters! Elaborei este cronograma de aulas! Fico no aguardo da confirmação da equipe!");

    try {
      // Captura a tabela como imagem
      const canvas = await html2canvas(tabelaConfirmacao, {
        scale: 2, // Aumenta a escala para melhor qualidade
        useCORS: true // Necessário se houver imagens externas na tabela
      });
      const imageData = canvas.toDataURL('image/png'); // Obtém a imagem em base64

      // Tenta usar a Web Share API (melhor para mobile)
      if (navigator.share && navigator.canShare({ files: [] })) { // Verifica se pode compartilhar arquivos
        const blob = await (await fetch(imageData)).blob();
        const file = new File([blob], "cronograma_aulas.png", { type: "image/png" });

        try {
          await navigator.share({
            files: [file],
            title: 'Cronograma de Aulas',
            text: decodeURIComponent(message)
          });
          console.log('Conteúdo compartilhado com sucesso!');
        } catch (error) {
          console.error('Erro ao compartilhar via Web Share API:', error);
          // Fallback para WhatsApp URL se Web Share falhar
          window.open(`https://wa.me/?text=${message}`, '_blank');
        }
      } else {
        // Fallback para WhatsApp URL (não permite anexar imagem diretamente, apenas texto)
        // Para compartilhar imagem, o usuário precisaria anexar manualmente.
        // Uma alternativa seria um serviço de upload de imagem e compartilhar o link.
        // Por simplicidade, aqui apenas abre o WhatsApp com a mensagem.
        window.open(`https://wa.me/?text=${message}`, '_blank');
        alert("Houve um erro ao compartilhar a imagem diretamente. O WhatsApp foi aberto com a mensagem. Por favor, anexe a imagem manualmente.");
      }
    } catch (error) {
      console.error("Erro ao gerar ou compartilhar a imagem:", error);
      alert("Houve um erro ao compartilhar a imagem.");
    }
  });

  // ==============================
  // Botão: Baixar Cronograma
  // ==============================
  btnBaixarCronograma.addEventListener("click", async () => {
    try {
      const canvas = await html2canvas(tabelaConfirmacao, {
        scale: 2, // Aumenta a escala para melhor qualidade
        useCORS: true
      });
      const imageData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'cronograma_aulas.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar a imagem:", error);
      alert("Houve um erro ao baixar a imagem.");
    }
  });
});
