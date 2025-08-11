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
  const tabelaConfirmacao = document.getElementById("tabela-confirmacao");

  // Botões
  const btnPrevMonth = document.getElementById("prev-month");
  const btnNextMonth = document.getElementById("next-month");
  const btnVoltar = document.getElementById("btn-voltar");
  const btnAvancar = document.getElementById("btn-avancar");
  const btnEditar = document.getElementById("btn-editar");
  const btnRepetirAulas = document.getElementById("btn-repetir-aulas");
  const btnEnviarCronograma = document.getElementById("btn-enviar-cronograma");
  const btnBaixarCronograma = document.getElementById("btn-baixar-cronograma");

  // Variáveis de estado
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
    
    // Dias vazios para alinhar o primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      calendarDays.appendChild(document.createElement("div"));
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Dias do mês
    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;
      const dateKey = `${day}/${month + 1}/${year}`;
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);

      const isPastDay = currentDate < hoje;

      if (isPastDay) dayDiv.classList.add("past-day");
      if (selectedDays.includes(dateKey)) dayDiv.classList.add("selected-day");
      
      // Destacar dia atual se não for passado
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

    // Preencher dias restantes da última semana
    const totalCells = firstDay + totalDays;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.appendChild(document.createElement("div"));
    }
  }

  // Inicializar calendário
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
        <option value="Sociologia">Pedagogia</option>
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

    // Evento para deletar card
    card.querySelector('.delete-btn').addEventListener('click', () => {
      selectedDays = selectedDays.filter(day => day !== dateKey);
      renderCalendar(dataAtual);
      gsap.to(card, { 
        opacity: 0, 
        y: -20, 
        duration: 0.3, 
        onComplete: () => {
          card.remove();
          atualizarTotalHoras();
        }
      });
    });

    // Atualizar total de horas quando mudar duração
    card.querySelector('.select-duracao').addEventListener('change', atualizarTotalHoras);
    
    selectionContainer.appendChild(card);

    // Animação de entrada
    gsap.fromTo(card, { opacity: 0, y: 20 }, { 
      opacity: 1, 
      y: 0, 
      duration: 0.4 
    });

    contadorAulas++;
    atualizarTotalHoras();

    // Scroll para o novo card
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
    // Verifica se há aulas selecionadas
    if (selectedDays.length === 0) {
      alert("Por favor, selecione pelo menos um dia de aula antes de avançar.");
      return;
    }
    
    gerarTabelaConfirmacao();
    sectionSelecao.style.display = "none";
    sectionConfirmacao.style.display = "block";
    gsap.fromTo(sectionConfirmacao, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    
    // Scroll para o topo da seção de confirmação
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==============================
  // Evento: Editar dias de aula (Voltar para Seleção)
  // ==============================
  btnEditar.addEventListener("click", () => {
    sectionConfirmacao.style.display = "none";
    sectionSelecao.style.display = "block";
    animarEntradaSelecao();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==============================
  // Geração da Tabela de Confirmação
  // ==============================
  function gerarTabelaConfirmacao() {
    tabelaCorpo.innerHTML = "";
    const cards = document.querySelectorAll(".selection-card");
    
    cards.forEach(card => {
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
  // Botão: Repetir mesma matéria e horários
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

      // Preenche apenas campos vazios
      if (!currentTimeInput.value && firstCardTime) {
        currentTimeInput.value = firstCardTime;
      }
      
      if (!currentDurationSelect.value && firstCardDuration) {
        currentDurationSelect.value = firstCardDuration;
      }
      
      if (!currentMateriaSelect.value && firstCardMateria) {
        currentMateriaSelect.value = firstCardMateria;
      }
    }

    // Atualiza o total de horas após preencher durações
    atualizarTotalHoras();
    
    // Feedback visual
    gsap.fromTo(btnRepetirAulas, 
      { backgroundColor: '#f28705' }, 
      { 
        backgroundColor: '#4CAF50', 
        duration: 0.3,
        onComplete: () => {
          gsap.to(btnRepetirAulas, { 
            backgroundColor: '#f28705', 
            delay: 0.5,
            duration: 0.3 
          });
        }
      }
    );
  });

  // ==============================
  // Botão: Enviar Cronograma (Compartilhar via WhatsApp)
  // ==============================
  btnEnviarCronograma.addEventListener("click", async () => {
    try {
      // Mostrar loading
      btnEnviarCronograma.textContent = "Gerando imagem...";
      btnEnviarCronograma.disabled = true;

      // Capturar a tabela como imagem
      const canvas = await html2canvas(tabelaConfirmacao, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
        backgroundColor: '#f9f9f9'
      });

      // Converter para blob
      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], "cronograma_aulas.png", { type: "image/png" });
          const shareData = {
            title: "Cronograma de Aulas",
            text: "Olá Masters! Elaborei este cronograma de aulas! Fico no aguardo da confirmação da equipe!",
            files: [file]
          };

          // Tentar usar Web Share API (mobile)
          if (navigator.share && navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } 
          // Fallback para WhatsApp Web
          else if (navigator.userAgent.includes("WhatsApp")) {
            const formData = new FormData();
            formData.append('file', file);
            // Aqui você precisaria de um backend para enviar a imagem
            alert("Por favor, anexe a imagem manualmente no WhatsApp.");
          }
          // Fallback genérico
          else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'cronograma_aulas.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert("Cronograma baixado! Por favor, envie a imagem manualmente pelo WhatsApp.");
          }
        } catch (error) {
          console.error("Erro ao compartilhar:", error);
          alert("Houve um erro ao compartilhar. Você pode baixar a imagem e enviar manualmente.");
        } finally {
          btnEnviarCronograma.textContent = "Enviar Cronograma";
          btnEnviarCronograma.disabled = false;
        }
      }, 'image/png');
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Houve um erro ao gerar a imagem do cronograma.");
      btnEnviarCronograma.textContent = "Enviar Cronograma";
      btnEnviarCronograma.disabled = false;
    }
  });

  // ==============================
  // Botão: Baixar Cronograma
  // ==============================
  btnBaixarCronograma.addEventListener("click", async () => {
    try {
      btnBaixarCronograma.textContent = "Preparando download...";
      btnBaixarCronograma.disabled = true;

      const canvas = await html2canvas(tabelaConfirmacao, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f9f9f9'
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'cronograma_aulas.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar a imagem:", error);
      alert("Houve um erro ao baixar a imagem.");
    } finally {
      btnBaixarCronograma.textContent = "Baixar Cronograma";
      btnBaixarCronograma.disabled = false;
    }
  });

  // ==============================
  // Ajustes de redimensionamento
  // ==============================
  window.addEventListener('resize', () => {
    // Forçar rerender do calendário em resize
    renderCalendar(dataAtual);
  });
});