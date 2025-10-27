(function() {
  const container = document.getElementById('my-calculator');
  if (!container) return;
  const configUrl = container.getAttribute('data-config');
  if (!configUrl) return;

  // ✅ FINAL UPDATED CSS with animation, accessibility, and SLIDER TRACK FIX
  const style = document.createElement('style');
  style.textContent = `
    /* Keyframe Animation for Result Pop */
    @keyframes result-pop {
        0% { transform: scale(0.95); opacity: 0.5; color: #ff9800; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); color: #2c6e49; }
    }

    /* 1. General & Typography */
    .calculator-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background:#f6f9f6;
      padding:18px; 
      border-radius:14px; 
      box-sizing:border-box;
    }
    .calculator-widget h2 { 
      color:#388e3c;
      font-weight: 700; 
      margin-top: 5px;
      margin-bottom: 20px;
    }
    .calculator-widget .inputs, .calculator-widget .outputs {
      display:flex; flex-wrap:wrap; gap:20px;
      margin-top:15px;
    }

    /* 2. Card Styling */
    .calculator-widget .card {
      background:#fff;
      padding:15px; 
      border-radius:12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 
                  0 1px 3px rgba(0, 0, 0, 0.08); 
      flex:1 1 200px;
      box-sizing:border-box;
      transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s;
    }
    .calculator-widget .card:hover {
      transform: translateY(-4px); 
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1),
                  0 2px 5px rgba(0, 0, 0, 0.12);
    }

    /* 3. Input & Slider Styling */
    .calculator-widget label { display:block; margin-bottom:6px; font-weight:600; font-size: 0.95em; }
    .calculator-widget input[type=number] {
      width:100%; padding:8px 10px;
      border-radius:8px; 
      border:1px solid #ddd;
      box-sizing:border-box;
      -webkit-appearance:none;
      appearance:none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .calculator-widget input[type=number]:focus {
      outline:none; 
      border-color:#2c6e49;
      background: #fcfcfc;
      box-shadow: 0 0 0 3px rgba(44, 110, 73, 0.2);
    }
    .calculator-widget .slider-wrapper {
      display:flex; align-items:center; gap:10px; margin-bottom:5px;
    }
    .calculator-widget input[type=range] {
      flex:1; 
      height: 20px; /* Increased height to make track styling easier to override */
      cursor:pointer; 
      accent-color:#2c6e49;
      background: transparent; /* Needed for custom track styles */
      -webkit-appearance: none;
      appearance: none;
      padding: 0;
    }

    /* 🎯 SLIDER TRACK FIX: WebKit (Chrome/Safari) */
    .calculator-widget input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        border: none;
    }

    /* 🎯 SLIDER TRACK FIX: Mozilla (Firefox) */
    .calculator-widget input[type=range]::-moz-range-track {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        border: none;
    }

    /* Optional: Style the thumb to match */
    .calculator-widget input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #2c6e49;
        cursor: pointer;
        margin-top: -5px; /* Adjust to center the thumb on the 6px track */
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }

    .calculator-widget input[type=range]::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #2c6e49;
        cursor: pointer;
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    /* End Slider Fix */
    
    .calculator-widget .slider-value {
      min-width:40px; text-align:right;
      font-weight:bold; color:#2c6e49;
      font-size: 1.05em;
    }
    .calculator-widget .hint {
      font-size:0.8em; color:#777; margin-top:8px; line-height:1.4;
    }

    /* 4. Output Section Styling */
    .calculator-widget .card h4 { margin-top:0; margin-bottom:12px; color:#2c6e49; }
    .calculator-widget .output-field {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      border-bottom: 1px dashed #eee;
      padding-bottom: 5px;
      line-height: 1.4;
    }
    .calculator-widget .output-field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .calculator-widget .output-label {
      color: #555; 
      font-weight: normal;
    }
    .calculator-widget .output-value {
      color: #2c6e49; 
      font-weight: bold;
      font-size: 1.15em; 
      display: inline-block;
    }
    .calculator-widget .output-value.animate {
        animation: result-pop 0.3s ease-out 1;
    }

    /* 5. Summary Section Emphasis */
    .calculator-widget .summary {
      background:#e6f4ea; 
      padding:15px; 
      border-radius:12px; 
      margin-top:20px; 
      color:#1f4d2f; 
      font-weight:normal;
      border-left: 6px solid #2c6e49;
      font-size: 1.05em;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .calculator-widget .summary-icon {
        font-size: 1.5em;
        color: #2c6e49;
        line-height: 1;
        transform: translateY(-2px);
    }
    .calculator-widget .summary-content strong { display: block; margin-bottom: 5px; font-size: 1.1em; }

    /* 6. Optional Toggle Styling */
    .calculator-widget .optional-toggle {
      background:#d8f0d8; border:none; padding:8px 14px;
      cursor:pointer; border-radius:8px; 
      color:#2c6e49;
      font-weight:600; 
      display:flex; align-items:center; gap:8px;
      margin-top:10px; 
      margin-bottom:0; 
      transition: background 0.2s, transform 0.1s;
    }
    .calculator-widget .optional-toggle:hover { background:#c7eac7; }
    .calculator-widget .optional-toggle:active { transform: scale(0.99); }
    .calculator-widget .optional-toggle .icon { 
      transition: transform 0.25s ease-out; 
      display:inline-block; 
    }
    .calculator-widget .optional-section {
      overflow:hidden;
      max-height:0;
      opacity:0;
      display:flex;
      flex-wrap:wrap;
      gap:20px;
      margin-top: 15px;
      transition:max-height 0.5s ease-in-out, opacity 0.4s ease;
    }
    .calculator-widget .optional-section.open {
      opacity:1;
      max-height:1000px;
    }
    /* 7. Responsiveness Polish */
    @media(max-width:550px){ 
      .calculator-widget { padding: 15px; }
      .calculator-widget .card { flex:1 1 100%; padding: 12px; }
      .calculator-widget .inputs, .calculator-widget .outputs, .calculator-widget .optional-section { gap:15px; }
    }
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
        summaryDiv.innerHTML = `<span class="summary-icon">💡</span><div class="summary-content"><strong>Uw Resultaat</strong></div>`;
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
          div.className = 'output-field';
          div.innerHTML = `<span class="output-label">${field.label}:</span> <span class="output-value" id="${field.value}">0</span>`;
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
              <input type="range" id="${input.id}" value="${input.default}" min="${input.min}" max="${input.max}" step="${input.step}" aria-label="${input.label} schuifregelaar">
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
          el.addEventListener('change', calculate);
          el.addEventListener('input', calculate); 
          inputElements[input.id] = el;
        }
        parent.appendChild(card);
      }

      // ✅ Calculation logic
      function calculate(){
        const scope={};
        config.inputs.forEach(input => { 
            let val = parseFloat(inputElements[input.id].value);
            scope[input.id] = isNaN(val) ? 0 : val;
        });
        
        config.calculations.forEach(calc=>{
          try{
            scope[calc.id] = eval(calc.formula.replace(/\b(\w+)\b/g,(m,name)=>name in scope?`scope.${name}`:name));
          }catch(e){ console.error('Berekeningsfout', calc.id, e); }
        });
        
        config.outputs.forEach(section=>{
          section.fields.forEach(field=>{
            const val = scope[field.value];
            const outputEl = document.getElementById(field.value);
            
            if(val!==undefined && outputEl){
              const formatted = field.precision!==undefined ? val.toFixed(field.precision) : val;
              
              if(outputEl.textContent !== formatted){
                outputEl.classList.remove('animate');
                void outputEl.offsetWidth; 
                outputEl.classList.add('animate');
              }
              outputEl.textContent = formatted;
            }
          });
        });
        
        if(summaryDiv){
          let summary = config.layout.summary_template;
          summary = summary.replace(/\{\{(.*?)\}\}/g, (_,expr)=>{
            try{ return eval(expr.replace(/\b(\w+)\b/g,(m,name)=>name in scope?`scope.${name}`:name)); }
            catch(e){ return '?'; }
          });
          
          const summaryContentDiv = summaryDiv.querySelector('.summary-content');
          if (summaryContentDiv) {
            summaryContentDiv.innerHTML = `<strong>Uw Resultaat</strong><br>${summary}`;
          }
        }
      }
      calculate();
    })
    .catch(err => {
      container.innerHTML = 'Kon de calculator niet laden.';
      console.error(err);
    });
})();
