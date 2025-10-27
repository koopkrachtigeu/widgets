(function() {
  const container = document.getElementById('my-calculator');
  if (!container) return;
  const configUrl = container.getAttribute('data-config');
  if (!configUrl) return;

  // ✅ CSS met animaties
  const style = document.createElement('style');
  style.textContent = `
    .calculator-widget {
      font-family: Arial, sans-serif;
      background:#f6f9f6;
      padding:15px;
      border-radius:12px;
      box-sizing:border-box;
    }
    .calculator-widget h2 { color:#2c6e49; margin-top:0; }
    .calculator-widget .inputs, .calculator-widget .outputs {
      display:flex; flex-wrap:wrap; gap:15px; margin-top:10px;
    }
    .calculator-widget .card {
      background:#fff;
      padding:12px;
      border-radius:10px;
      box-shadow:0 2px 6px rgba(0,0,0,0.08);
      flex:1 1 200px;
      box-sizing:border-box;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .calculator-widget .card:hover {
      transform: translateY(-2px);
      box-shadow:0 4px 10px rgba(0,0,0,0.1);
    }
    .calculator-widget label { display:block; margin-bottom:5px; font-weight:bold; }
    .calculator-widget input[type=number] {
      width:100%; padding:6px 8px;
      border-radius:6px; border:1px solid #ccc;
      box-sizing:border-box;
      -webkit-appearance:none;
      appearance:none;
    }
    .calculator-widget input[type=number]:focus {
      outline:none; border-color:#2c6e49;
      box-shadow:0 0 0 2px rgba(44,110,73,0.15);
    }
    .calculator-widget .slider-wrapper {
      display:flex; align-items:center; gap:10px; margin-bottom:5px;
    }
    .calculator-widget input[type=range] {
      flex:1; height:4px; cursor:pointer;
      accent-color:#2c6e49;
    }
    .calculator-widget .slider-value {
      min-width:35px; text-align:right;
      font-weight:bold; color:#2c6e49;
    }
    .calculator-widget .hint {
      font-size:0.85em; color:#555; margin-bottom:5px; line-height:1.3;
    }
    .calculator-widget .summary {
      background:#e6f4ea; padding:10px;
      border-radius:10px; margin-top:10px;
      color:#1f4d2f; font-weight:bold;
    }
    .calculator-widget .optional-toggle {
      background:#d8f0d8; border:none; padding:6px 12px;
      cursor:pointer; border-radius:6px; color:#2c6e49;
      font-weight:bold; display:flex; align-items:center; gap:6px;
      margin-bottom:10px; transition: background 0.2s;
    }
    .calculator-widget .optional-toggle:hover { background:#c7eac7; }
    .calculator-widget .optional-toggle .icon { transition: transform 0.25s; display:inline-block; }
    .calculator-widget .optional-section {
      overflow:hidden;
      max-height:0;
      opacity:0;
      display:flex;
      flex-wrap:wrap;
      gap:15px;
      transition:max-height 0.4s ease, opacity 0.4s ease;
    }
    .calculator-widget .optional-section.open {
      opacity:1;
      max-height:1000px;
    }
    @media(max-width:500px){ .calculator-widget .card { flex:1 1 100%; } }
  `;
  document.head.appendChild(style);

  fetch(configUrl)
    .then(res => res.json())
    .then(config => {
      container.classList.add('calculator-widget');
      container.innerHTML = `<h2>${config.title}</h2><p>${config.description}</p>`;

      const inputsDiv = document.createElement('div');
      inputsDiv.className='inputs';
      container.appendChild(inputsDiv);

      const outputsDiv = document.createElement('div');
      outputsDiv.className='outputs';
      container.appendChild(outputsDiv);

      let summaryDiv;
      if(config.layout.show_summary){
        summaryDiv = document.createElement('div');
        summaryDiv.className='summary';
        container.appendChild(summaryDiv);
      }

      const requiredInputs = config.inputs.filter(i => i.required);
      const optionalInputs = config.inputs.filter(i => !i.required);
      const inputElements = {};

      // ✅ Render required inputs
      requiredInputs.forEach(input => renderInput(input, inputsDiv, inputElements));

      // ✅ Optional section with animation
      if(optionalInputs.length > 0){
        const toggle = document.createElement('button');
        toggle.className='optional-toggle';
        toggle.innerHTML = `<span class="icon">▶</span> Optionele parameters`;
        inputsDiv.appendChild(toggle);

        const optionalDiv = document.createElement('div');
        optionalDiv.className='optional-section';
        inputsDiv.appendChild(optionalDiv);

        toggle.addEventListener('click', () => {
          const isOpen = optionalDiv.classList.toggle('open');
          toggle.querySelector('.icon').style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        });

        optionalInputs.forEach(input => renderInput(input, optionalDiv, inputElements));
      }

      // ✅ Render outputs
      const outputElements = {};
      config.outputs.forEach(section => {
        const card = document.createElement('div');
        card.className='card';
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

      // Helper render input
      function renderInput(input, parent, inputElements){
        const card = document.createElement('div');
        card.className='card';
        if(input.type === 'slider'){
          card.innerHTML = `
            <label for="${input.id}">${input.label}</label>
            <div class="slider-wrapper">
              <input type="range" id="${input.id}" value="${input.default}" min="${input.min}" max="${input.max}" step="${input.step}">
              <span class="slider-value">${input.default}</span>
            </div>
            <div class="hint">${input.hint||''}</div>
          `;
          const slider = card.querySelector('input');
          const valLabel = card.querySelector('.slider-value');
          slider.addEventListener('input', () => { valLabel.textContent = slider.value; calculate(); });
          inputElements[input.id] = slider;
        } else {
          card.innerHTML = `
            <label for="${input.id}">${input.label}</label>
            <input type="number" id="${input.id}" value="${input.default}" min="${input.min}" max="${input.max}" step="${input.step}">
            <div class="hint">${input.hint||''}</div>
          `;
          const el = card.querySelector('input');
          el.addEventListener('input', calculate);
          inputElements[input.id] = el;
        }
        parent.appendChild(card);
      }

      // ✅ Calculation logic
      function calculate(){
        const scope={};
        config.inputs.forEach(input => { scope[input.id]=parseFloat(inputElements[input.id].value); });
        config.calculations.forEach(calc=>{
          try{
            scope[calc.id] = eval(calc.formula.replace(/\b(\w+)\b/g,(m,name)=>name in scope?`scope.${name}`:name));
          }catch(e){ console.error('Berekeningsfout', calc.id, e); }
        });
        config.outputs.forEach(section=>{
          section.fields.forEach(field=>{
            const val = scope[field.value];
            if(val!==undefined){
              const formatted = field.precision!==undefined ? val.toFixed(field.precision) : val;
              document.getElementById(field.value).textContent = `${field.label}: ${formatted}`;
            }
          });
        });
        if(summaryDiv){
          let summary = config.layout.summary_template;
          summary = summary.replace(/\{\{(.*?)\}\}/g, (_,expr)=>{
            try{ return eval(expr.replace(/\b(\w+)\b/g,(m,name)=>name in scope?`scope.${name}`:name)); }
            catch(e){ return '?'; }
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
