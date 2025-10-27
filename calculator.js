(function() {
  // Vind de container
  const container = document.getElementById('my-calculator');
  if (!container) {
    console.error('Container #my-calculator niet gevonden');
    return;
  }

  const configUrl = container.getAttribute('data-config');
  if (!configUrl) {
    console.error('data-config attribuut ontbreekt op #my-calculator');
    return;
  }

  // Voeg basis CSS toe
  const style = document.createElement('style');
  style.textContent = `
    .calculator-widget { font-family: Arial, sans-serif; background:#f6f9f6; padding:15px; border-radius:12px; }
    .calculator-widget h2 { color:#2c6e49; margin-top:0; }
    .calculator-widget .inputs, .calculator-widget .outputs { display:flex; flex-wrap:wrap; gap:15px; margin-top:10px; }
    .calculator-widget .card { background:#fff; padding:15px; border-radius:10px; box-shadow:0 3px 8px rgba(0,0,0,0.05); flex:1 1 200px; }
    .calculator-widget label { display:block; margin-bottom:5px; font-weight:bold; }
    .calculator-widget input[type=number], .calculator-widget input[type=range] { width:100%; margin-bottom:8px; }
    .calculator-widget input[type=range] { accent-color:#2c6e49; }
    .calculator-widget .summary { background:#e6f4ea; padding:10px; border-radius:10px; margin-top:10px; color:#1f4d2f; font-weight:bold; }
  `;
  document.head.appendChild(style);

  // Haal JSON config op
  fetch(configUrl)
    .then(res => res.json())
    .then(config => {
      container.classList.add('calculator-widget');
      container.innerHTML = `<h2>${config.title}</h2><p>${config.description}</p>`;

      const inputsDiv = document.createElement('div');
      inputsDiv.className = 'inputs';
      container.appendChild(inputsDiv);

      const outputsDiv = document.createElement('div');
      outputsDiv.className = 'outputs';
      container.appendChild(outputsDiv);

      let summaryDiv;
      if (config.layout.show_summary) {
        summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary';
        container.appendChild(summaryDiv);
      }

      const inputElements = {};
      config.inputs.forEach(input => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <label for="${input.id}">${input.label}</label>
          <input type="${input.type}" id="${input.id}" value="${input.default}" min="${input.min}" max="${input.max}" step="${input.step}">
        `;
        inputsDiv.appendChild(card);
        const inputEl = card.querySelector('input');
        inputElements[input.id] = inputEl;
        inputEl.addEventListener('input', calculate);
      });

      const outputElements = {};
      config.outputs.forEach(section => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h4>${section.label}</h4>`;
        section.fields.forEach(field => {
          const div = document.createElement('div');
          div.id = field.value;
          div.textContent = `${field.label}: 0`;
          card.appendChild(div);
          outputElements[field.value] = field;
        });
        outputsDiv.appendChild(card);
      });

      function calculate() {
        const scope = {};
        // inputs
        config.inputs.forEach(input => {
          scope[input.id] = parseFloat(inputElements[input.id].value);
        });
        // calculations
        config.calculations.forEach(calc => {
          try {
            scope[calc.id] = eval(calc.formula.replace(/\b(\w+)\b/g, (_, name) => name in scope ? `scope.${name}` : name));
          } catch (e) {
            console.error('Fout bij berekening', calc.id, e);
          }
        });
        // outputs
        config.outputs.forEach(section => {
          section.fields.forEach(field => {
            const val = scope[field.value];
            if (val !== undefined) {
              const formatted = field.precision !== undefined ? val.toFixed(field.precision) : val;
              document.getElementById(field.value).textContent = `${field.label}: ${formatted}`;
            }
          });
        });
        // summary
        if (summaryDiv) {
          let summary = config.layout.summary_template;
          summary = summary.replace(/\{\{(.*?)\}\}/g, (_, expr) => {
            try {
              return eval(expr.replace(/\b(\w+)\b/g, (_, name) => name in scope ? `scope.${name}` : name));
            } catch (e) {
              return '?';
            }
          });
          summaryDiv.textContent = summary;
        }
      }

      calculate();
    })
    .catch(err => {
      container.innerHTML = 'Kon de calculator niet laden.';
      console.error(err);
    });
})();
