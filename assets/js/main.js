// Get elements for form toggle
const editBtn = document.getElementById("edit-btn");
const formContainer = document.getElementById("form-container");
const avatarInput = document.getElementById("avatar");
const avatarPreview = document.getElementById("avatar-preview");
const form = document.getElementById("profile-form");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const userModal = document.getElementById("user-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-content");
// Toggle visibility of the form on button click
// Add a click event listener to the 'editBtn' button
editBtn.addEventListener("click", function () {
  // Toggle the visibility of the 'formContainer' element by adding or removing the 'hidden' class
  // If the 'hidden' class is present, it will be removed, making the form visible.
  // If the 'hidden' class is not present, it will be added, hiding the form.
  formContainer.classList.toggle("hidden");
});

// Listen for input changes in the 'avatarInput' field
avatarInput.addEventListener("input", function () {
  // Update the 'src' of the 'avatarPreview' image with the new URL entered in the 'avatarInput' field
  avatarPreview.src = avatarInput.value;

  // Remove the 'hidden' class from the avatar preview to display the image once a valid URL is entered
  avatarPreview.classList.remove("hidden");
});
// Close the form when the user clicks outside the modal (on the overlay)
formContainer.addEventListener("click", function (e) {
  // Check if the clicked area is the form container itself (not a child element)
  if (e.target === formContainer) {
    // Add the 'hidden' class to the form container to hide it
    formContainer.classList.add("hidden");
  }
});

// Fetch user data from the API and process it
fetch("https://api.escuelajs.co/api/v1/users")
  .then((response) => response.json()) // Parse the response into JSON
  .then((users) => {
    console.log(users); // Log the user data to the console for debugging

    // Get the container element where user cards will be displayed
    const userContainer = document.getElementById("user-container");

    // Loop through the list of users and create a card for each one
    users.forEach((user) => {
      // Create a new div element for the user card
      const userCard = document.createElement("div");

      // Add classes for styling the card
      userCard.classList.add(
        "bg-white", // White background
        "rounded-lg", // Rounded corners
        "shadow-lg", // Shadow effect
        "p-6", // Padding
        "text-center", // Centered text
        "mb-4" // Bottom margin
      );

      // Set the inner HTML of the card with user data
      userCard.innerHTML = `
      <img src="${user.avatar}" alt="Avatar" class="w-24 h-24 rounded-full mx-auto mb-4">
      <h2 class="text-xl font-semibold mb-2">${user.name}</h2>
      <p class="text-gray-600 mb-2">${user.email}</p>
      <p class="text-gray-500 mb-4">Role: <span class="font-bold">${user.role}</span></p>

      <!-- View Profile Button -->
      <button class="view-profile-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" data-user-id="${user.id}">View Profile</button>

      <!-- Edit Button -->
      <button class="edit-profile-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" data-user-id="${user.id}">Edit</button>

      <!-- Check Email Availability Button -->
      <button class="check-email-btn bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50" data-email="${user.email}">Check Email Availability</button>

      <!-- Message Placeholder for Email Availability -->
      <div class="email-availability-message text-sm mt-2 text-gray-500"></div>
    `;

      // Append the generated user card to the user container in the DOM
      userContainer.appendChild(userCard);

      // Add event listener for the "View Profile" button to show user details in a modal
      userCard
        .querySelector(".view-profile-btn")
        .addEventListener("click", function () {
          const userId = this.dataset.userId; // Retrieve user ID from the button's data attribute
          fetchUserDetails(userId); // Call a function to fetch and display the user's profile details in a modal
        });

      // Add event listener for the "Edit" button to show the user details for editing
      userCard
        .querySelector(".edit-profile-btn")
        .addEventListener("click", function () {
          const userId = this.dataset.userId; // Retrieve user ID from the button's data attribute
          fetchUserDetailsForEdit(userId); // Call a function to fetch the user's data and display it in an edit form
        });

      // Add event listener for the "Check Email Availability" button to verify if the email is available
      userCard
        .querySelector(".check-email-btn")
        .addEventListener("click", function () {
          const email = this.dataset.email; // Retrieve the email from the button's data attribute
          console.log("Checking email availability for:", email); // Log the email to be checked (for debugging)
          checkEmailAvailability(email, userCard); // Call a function to check if the email is already in use
        });
    });
  })
  .catch((error) => console.error("Error fetching users:", error)); // Catch any errors during the fetch operation
// Fetch user data from the API and process it

// Fetch user details for editing and pre-fill the form with current user data
function fetchUserDetailsForEdit(userId) {
  // Send a GET request to the API to fetch user details based on the provided userId
  fetch(`https://api.escuelajs.co/api/v1/users/${userId}`)
    .then((response) => response.json()) // Parse the response into JSON format
    .then((user) => {
      // Pre-fill the form with the user's current data
      // Set the value of each form field with the corresponding user property
      document.getElementById("name").value = user.name; // Fill name input field
      document.getElementById("email").value = user.email; // Fill email input field
      document.getElementById("avatar").value = user.avatar; // Fill avatar input field

      // Show the form container by removing the 'hidden' class
      // This makes the form visible so the user can edit their information
      document.getElementById("form-container").classList.remove("hidden");

      // Handle form submission when the user submits the form to update their profile
      document.getElementById("profile-form").onsubmit = function (e) {
        e.preventDefault(); // Prevent the default form submission (page reload)

        // Create an object with the updated user data from the form fields
        const updatedUserData = {
          name: document.getElementById("name").value, // Get updated name from form
          email: document.getElementById("email").value, // Get updated email from form
          avatar: document.getElementById("avatar").value, // Get updated avatar URL from form
        };

        // Send a PUT request to update the user data with the new values
        updateUser(userId, updatedUserData); // Call the function to update the user on the server
      };
    })
    .catch((error) => {
      // Log any errors that occur during the fetch request
      console.error("Error fetching user details:", error);
    });
}

// Update user data by sending a PUT request to the API
function updateUser(userId, userData) {
  console.log(userData); // Log the updated user data to the console (for debugging)

  // Create the body of the PUT request with the updated user data
  const body = {
    email: userData.email, // User's updated email
    name: userData.name, // User's updated name
    avatar: userData.avatar, // User's updated avatar URL
  };

  // Send the PUT request to the API to update the user details
  fetch(`https://api.escuelajs.co/api/v1/users/${userId}`, {
    method: "PUT", // HTTP method for updating data
    headers: {
      "Content-Type": "application/json", // Specify that the body content is JSON
    },
    body: JSON.stringify(body), // Convert the body object to a JSON string for the request
  })
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // Check if the user was successfully updated (based on the returned data object)
      if (data.id) {
        // If the user was updated, show a success message and perform follow-up actions
        alert("User updated successfully!");

        // Hide the form container (close the form)
        document.getElementById("form-container").classList.add("hidden");

        // Refresh the user list (reload the data or update the view)
        resetUserList();
      } else {
        // If the update was unsuccessful, show an error message
        alert("Error updating user.");
      }
    })
    .catch((error) => {
      // If there's an error during the fetch operation, log it to the console
      console.error("Error updating user:", error);
      // Optionally, show a more user-friendly error message
      // alert("There was an error updating the user.");
    });
}

// Function to refresh the user list after updating a user's data
function resetUserList() {
  // Get the container element where user cards are displayed
  const userContainer = document.getElementById("user-container");

  // Clear the current content of the user container to make way for fresh data
  userContainer.innerHTML = "";

  // Fetch the updated list of users from the API
  fetch("https://api.escuelajs.co/api/v1/users")
    .then((response) => response.json()) // Parse the response as JSON
    .then((users) => {
      // Loop through each user in the fetched data
      users.forEach((user) => {
        // Create a new div element to represent a user card
        const userCard = document.createElement("div");

        // Add styling classes to the user card
        userCard.classList.add(
          "bg-white", // White background
          "rounded-lg", // Rounded corners
          "shadow-lg", // Box shadow for a card-like appearance
          "p-6", // Padding for spacing
          "text-center" // Center-align the text
        );

        // Set the inner HTML of the user card with user data
        userCard.innerHTML = `
            <img src="${user.avatar}" alt="Avatar" class="w-24 h-24 rounded-full mx-auto mb-4">
            <h2 class="text-xl font-semibold mb-2">${user.name}</h2>
            <p class="text-gray-600 mb-2">${user.email}</p>
            <p class="text-gray-500 mb-4">Role: <span class="font-bold">${user.role}</span></p>
  
            <!-- View Profile Button -->
            <button class="view-profile-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" data-user-id="${user.id}">View Profile</button>
  
            <!-- Edit Button -->
            <button class="edit-profile-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" data-user-id="${user.id}">Edit</button>
          `;

        // Append the newly created user card to the user container in the DOM
        userContainer.appendChild(userCard);
      });
    })
    .catch((error) => {
      // If an error occurs during the fetch request, log it to the console
      console.error("Error fetching users:", error);
    });
}

// Fetch user details from the API when the "View Profile" button is clicked
function fetchUserDetails(userId) {
  // Make a GET request to the API to fetch the details of a user by their ID
  fetch(`https://api.escuelajs.co/api/v1/users/${userId}`)
    .then((response) => response.json()) // Parse the response into JSON format
    .then((user) => {
      // Populate the modal content with the fetched user data
      modalContent.innerHTML = `
          <h2 class="text-2xl font-semibold mb-4">${user.name}</h2> <!-- Display user's name -->
          <img src="${user.avatar}" alt="Avatar" class="w-24 h-24 rounded-full mx-auto mb-4"> <!-- Display user's avatar -->
          <p class="text-gray-600 mb-2">Email: ${user.email}</p> <!-- Display user's email -->
          <p class="text-gray-500 mb-2">Role: <span class="font-bold">${user.role}</span></p> <!-- Display user's role -->
          <p class="text-gray-500 mb-2">Password: <span class="font-bold">${user.password}</span></p> <!-- Display user's password -->
        `;

      // Remove the 'hidden' class from the modal to make it visible
      userModal.classList.remove("hidden"); // Show the modal with user details
    })
    .catch((error) => {
      // If there's an error fetching the user details, log the error to the console
      console.error("Error fetching user details:", error);
    });
}

// Close the modal when the "X" button is clicked
closeModalBtn.addEventListener("click", function () {
  // Add the 'hidden' class to the modal to hide it
  userModal.classList.add("hidden");
});

// Close the modal if the user clicks outside the modal content (on the overlay area)
userModal.addEventListener("click", function (e) {
  // Check if the clicked target is the modal itself, not the inner content
  if (e.target === userModal) {
    // Add the 'hidden' class to hide the modal if the user clicks outside
    userModal.classList.add("hidden");
  }
});

// Get form elements (assuming 'form' and 'errorMessage' are already defined elsewhere)

// Handle form submission
form.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission behavior (page reload)

  // Hide any previous error messages before starting validation
  errorMessage.classList.add("hidden");

  // Validate the form before submitting the data
  if (validateForm()) {
    // If the form is valid, collect the form data
    const formData = new FormData(form); // Create a FormData object to easily access form fields

    // Create an object to store the form data as key-value pairs
    const userData = {
      name: formData.get("name"), // Get the value of the "name" field
      email: formData.get("email"), // Get the value of the "email" field
      password: formData.get("password"), // Get the value of the "password" field
      avatar: formData.get("avatar"), // Get the value of the "avatar" field (image URL or file)
    };

    // Make the POST request to create a new user
    createUser(userData); // Pass the user data to the 'createUser' function to handle the API request
  }
});

// Function to send the POST request to create a new user
function createUser(userData) {
  // Make a POST request to the API endpoint to create a new user
  fetch("https://api.escuelajs.co/api/v1/users/", {
    method: "POST", // Specify the request method as POST
    headers: {
      "Content-Type": "application/json", // Indicate that we are sending JSON data
    },
    body: JSON.stringify(userData), // Convert the user data object to a JSON string
  })
    .then((response) => response.json()) // Parse the response to JSON format
    .then((data) => {
      if (data.id) {
        // If the response contains an ID, it means the user was created successfully
        console.log("User created successfully:", data);

        // Optionally, show a success message
        alert("User created successfully!");

        // Optionally, reset the form to clear the fields
        form.reset();

        // Hide the form container (assuming it's a modal or similar)
        formContainer.classList.add("hidden");
      } else {
        // If the response doesn't contain an ID, it means there was an error creating the user
        showError("Failed to create user. Please try again.");
      }
    })
    .catch((error) => {
      // Catch any errors that occurred during the fetch process
      console.error("Error creating user:", error);

      // Display a generic error message to the user
      showError("There was an error. Please try again.");
    });
}

// Function to display error messages
function showError(message) {
  // Set the error message text inside the 'errorText' element
  errorText.innerHTML = message;

  // Remove the 'hidden' class from the 'errorMessage' element to make it visible
  errorMessage.classList.remove("hidden");
}

// Form validation
// Validate the form fields
function validateForm() {
  let error = "";

  // Get form fields
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const avatar = document.getElementById("avatar").value.trim();

  // Validate Name (required)
  if (name === "") {
    error += "Name is required.<br>";
  }

  // Validate Email (required and must be valid)
  if (email === "") {
    error += "Email is required.<br>";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    error += "Email must be a valid email address.<br>";
  }

  // Validate Password (required and must be at least 6 characters)
  if (password === "") {
    error += "Password is required.<br>";
  } else if (password.length < 6) {
    error += "Password must be at least 6 characters.<br>";
  }

  // Validate Avatar URL (required and must be a valid URL)
  if (avatar === "") {
    error += "Avatar URL is required.<br>";
  } else if (!/^https?:\/\/[^\s]+$/.test(avatar)) {
    error +=
      "Avatar URL must be a valid URL starting with http:// or https://.<br>";
  }

  // If there are errors, show the error message and return false
  if (error !== "") {
    errorText.innerHTML = error;
    errorMessage.classList.remove("hidden");
    return false;
  }

  // If no errors, return true
  return true;
}

// Update user data with PUT request
function updateUser(userId, userData) {
  const body = {
    email: userData.email,
    name: userData.body,
  };
  fetch(`https://api.escuelajs.co/api/v1/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data, "updateUser");

      if (data.id) {
        alert("User updated successfully!");
        document.getElementById("form-container").classList.add("hidden"); // Close the form
        resetUserList(); // Refresh the user list
      } else {
        alert("Error updating user.");
      }
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      alert("There was an error updating the user.");
    });
}

// Handle form submission
form.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent form from submitting

  // Hide error message before validation
  errorMessage.classList.add("hidden");

  // Validate the form
  if (validateForm()) {
    console.log("Form submitted successfully!");
    form.reset(); // Reset the form
    formContainer.classList.add("hidden"); // Close the form modal
  }
});

// Function to check if an email is available
function checkEmailAvailability(email, userCard) {
  fetch("https://api.escuelajs.co/api/v1/users/is-available", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
    .then((response) => response.json())
    .then((data) => {
      const messageContainer = userCard.querySelector(
        ".email-availability-message"
      );

      if (data.isAvailable) {
        messageContainer.innerHTML = `The email <strong>${email}</strong> is available!`;
        messageContainer.classList.add("text-green-600");
        messageContainer.classList.remove("text-gray-500");
      } else {
        messageContainer.innerHTML = `The email <strong>${email}</strong> is already taken.`;
        messageContainer.classList.add("text-red-600");
        messageContainer.classList.remove("text-gray-500");
      }
    })
    .catch((error) => {
      console.error("Error checking email availability:", error);
      const messageContainer = userCard.querySelector(
        ".email-availability-message"
      );
      messageContainer.innerHTML =
        "There was an error checking email availability.";
      messageContainer.classList.add("text-red-600");
      messageContainer.classList.remove("text-gray-500");
    });
}
