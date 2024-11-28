# Use the official Python image with version 3.9
FROM python:3.9

# Create a new user to run the application
RUN useradd -m -u 1000 user

# Set the user for subsequent commands
USER user

# Update the PATH environment variable
ENV PATH="/home/user/.local/bin:$PATH"

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file into the container
COPY --chown=user ./requirements.txt requirements.txt

# Install the dependencies listed in requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the entire project into the container
COPY --chown=user . /app

# Expose the application port (7860) for Hugging Face Spaces
EXPOSE 7860

# Set the command to run the application using Flask-SocketIO and eventlet
CMD ["python", "app.py"]
