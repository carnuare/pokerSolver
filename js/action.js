const core = require('@actions/core')
 
const inputText = core.getInput('input_text');
const numOfRepeats = parseInt(core.getInput('num_of_repeats'));
 
let outputText = ""
let i;
console.log('Texto: ${inputText}' )
console.log('Nº veces a repetir: $ {numOfRepeats}')
for (i = 0; i < numOfRepeats; i++) {
    outputText += inputText;
}
 
core.setOutput('output_text', outputText)