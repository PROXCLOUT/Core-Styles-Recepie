
let stepForms = document.querySelectorAll(".form-steps"); // Added dot before form-steps to select by class

stepForms.forEach(form => {
    let steps = form.querySelectorAll(".step");

    let activeStep = form.querySelector(".step.active");
    let nextButton = form.querySelector(".button.next");

    let progressBar = form.querySelector(".steps-progress");
    nextButton.addEventListener('click', async function() {
        let inputs = activeStep.querySelectorAll("input, textarea");
        let inputsValid = true;

        inputs.forEach(input => {
            if(!verifyInput(input)) {
                inputsValid = false;
            }
            
        });

        if (inputsValid) {
            let nextSibling = activeStep.nextElementSibling;
            
            if (nextSibling) {

                if(!nextSibling.classList.contains("finish") && !nextSibling.classList.contains("loading")) {
                    nextSibling.classList.add('active');

                    activeStep.classList.remove('active');
                    activeStep.classList.add('done');
    
                    activeStep = nextSibling;
                    
                    countingSteps = Array.from(steps).filter(step => !step.classList.contains("finish") && !step.classList.contains("loading"));
                    progressBar.value = (Array.from(countingSteps).indexOf(activeStep) + 1) * (100 / countingSteps.length);

                } else {
                    progressBar.classList.add("finished");
                    nextButton.classList.add('finished');

                    nextSibling = activeStep.nextElementSibling;
                    activeStep.classList.remove("active");
                    activeStep.classList.add("done");

                    activeStep = nextSibling;
                    activeStep.classList.add("active");
                    //SUBMIT FORM AND PROCEED
                    let response = await fetchFormWithAuth(form);
                    if(response != false) {
                        nextSibling = activeStep.nextElementSibling;
                        nextSibling.classList.add('active');

                        activeStep.classList.remove('active');
                        activeStep.classList.add('done');
        
                        activeStep = nextSibling;
                        activeStep.querySelector("h2").innerText = JSON.stringify(response);
                    }
                    console.log(response);
                }
            } else {
                progressBar.classList.add("finished");
                nextButton.classList.add('finished');

                //SUBMIT FORM
                let loadingSlide = document.createElement("div");
                loadingSlide.classList.add("step", "loading", "vertical", "gap-m", "a-c");
                loadingSlide.innerHTML("<h2 class='plakativ-m text-center'>Laden...</h2>");

                activeStep.parentNode.appendChild(loadingSlide);
                activeStep.classList.remove("active");
                loadingSlide.classList.add("active");
                
                let response = await fetchFormWithAuth(form);
                if(response != false) {
                    console.log(response);
                    loadingSlide.querySelector("h2").innerText(JSON.stringify(response));
                    loadingSlide.classList.remove("active");

                    let finishSlide = document.createElement("div");
                    finishSlide.classList.add("step", "finish", "vertical", "gap-m", "a-c");
                    finishSlide.innerHTML("<h2 class='plakativ-m text-center'>"+JSON.stringify(response)+"</h2>");
                }
            }
        } else {
            //alert('Please fill in all required fields.');
        }
    });
});

async function fetchFormWithAuth(form) {
    console.log(new FormData(form));

    //form.submit();
    const formAction = form.getAttribute('action');
    let response; // Variable für die Antwort

    try {
        const res = await fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json', // Change content type to 'application/ld+json'
                'Authorization': `Bearer ${localStorage.getItem('usr')}` // Add JWT token from local storage
            },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        if (res.ok) { // Überprüfen, ob der Statuscode erfolgreich ist
            response = await res.json(); // Antwort als JSON parsen
        } else {
            console.error('Fehler beim Abrufen:', res.status, res.statusText); // Fehlerprotokollierung
            response = false; // Setze die Antwort auf null bei Fehler
        }

    } catch (error) {
        console.error('Error:', error);
    }

    return response; // Gibt die Antwort zurück
}


function verifyInput(input) {
    let inputsValid = true;

    // Find the first parent node with a .field class
    let fieldParent = input.parentNode;
    let error = "";

    let errorMessage = "";

    while (fieldParent && !fieldParent.classList.contains('field')) {
        fieldParent = fieldParent.parentNode;
    }

    if(input.required) {
        if (input.value.trim() === '') {
            inputsValid = false;
            error = "required";
            errorMessage = "Bitte fülle das Feld aus.";
        } 
        if(inputsValid) {
            if (input.type === 'email') {
                let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    inputsValid = false;
                    // Handle invalid email format here...
                    error = "invalid";
                    errorMessage = "Gib die E-Mail in einem gültigen Format ein.";
                }
            } else if (input.type === 'tel') {
                let telRegex = /^\+\d{11,18}$/; // Regex for the format +4366471239044
                if (!telRegex.test(input.value)) {
                    inputsValid = false;
                    // Handle invalid phone number format here...
                    error = "invalid";
                    errorMessage = "Gib die Telefonnummer in einem gültigen Format: +43........";
                }
            } else if (input.classList.contains("slug")) {
                let slugRegex = /^[a-z0-9-]+$/i; // Regex for slug format
                if (!slugRegex.test(input.value)) {
                    inputsValid = false;
                    // Handle invalid slug format here...
                    error = "invalid";
                    errorMessage = "Gib den Slug in einem gültigen Format ein: Nur Buchstaben, Zahlen und Bindestriche erlaubt.";
                }
            }
        }
    }

    if(!inputsValid) {
        if (fieldParent) {
            fieldParent.classList.add('error');
            fieldParent.setAttribute('data-field-error', error);
            let errorMessageNode = fieldParent.querySelector('.error-msg');

            if(!errorMessageNode) {
                errorMessageNode = document.createElement("p");
                errorMessageNode.classList.add("small", "error-msg");
                errorMessageNode.innerText = errorMessage;
                fieldParent.querySelector("label").appendChild(errorMessageNode);
            } else {
                errorMessageNode.innerText = errorMessage;
            }
        }
    } else {
        let errorMessageNode = fieldParent.querySelector('.error-msg');

        if(errorMessageNode) {
            errorMessageNode.remove();
            fieldParent.classList.remove('error');
            fieldParent.removeAttribute('data-field-error');
        }
    }

    return inputsValid;
}