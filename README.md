# EmotionGUI - UoA

Part 4 Research Project 2023(project #26) ECSE Department, University of Auckland

This repository contains all the required files for deploying the website on a server.

[This is the link to EmotionGUI](https://emotiongui-6e64839cbbec.herokuapp.com/home/home.html)

## Introduction
EmotionGUI is a user-intuitive tool for the visualisation and annotation of emotions in speech and video signals. This tool is currently intented for **Research Purposes** that will potentially be useful for speech based technologies in the future.

## Demo
https://github.com/hcho109/P4P_-26/assets/79812899/de74bbd6-4d78-4dbd-9fae-5be15383e504

## Annotation
![annotation](https://github.com/hcho109/P4P_-26/assets/79812899/77457974-89a3-4122-a18c-32018d6fd163)

The annotation section allows users to annotate emotions of a media(audio or video) file using categorical(discrete), 1D(Arousal vs time, Valence vs time and Dominance vs time)) or 2D model(Aroiusal, Valence vs time).

## Visualisation
![visualise](https://github.com/hcho109/P4P_-26/assets/79812899/d89c6295-6564-4c29-9a0f-e53c48bc375d)

The annotation section allows users to visualise speech emotions on a 2D Valence-Arousal plot that is encoded as a CSV file or a WAV file. (Machine learning emotion prediction using the WAV file upload is currently not functional)

## Live Audio Recording
![liveAudio](https://github.com/hcho109/P4P_-26/assets/79812899/55587c0d-c673-4f54-90b8-301710c2e689)

The Live-Audio section provides a real-time audio recording feature that can help create data for different emotional training and annotation tasks. Users can also visualise this live audio as a waveform or a spectrograme on the screen.

## Folders

- **about**: Contains HTML files needed for the help pages.

- **annotation**: Contains HTML, CSS, and JS files needed to run a fully functional EmotionGUI annotation page.

- **css**: Contains common CSS files used across multiple pages.

- **home**: Contains CSS, HTML files, and the downloadable test zip file.

- **live_audio**: Contains HTML, CSS, and JS files needed to run the live audio recording page.

- **nav**: Contains navigation HTML and CSS files.

- **resources**: Contains all the media files used on the website.

- **visualisation**: Contains HTML, CSS, and JS files needed for the functionality of the visualise page.

## Files

- **composer.json**: This file is used for managing the dependencies of the project if it's a PHP project. It lists the packages required by the project and may include other configuration settings. This is a must if the webiste is to be deployed on a server.  

- **index.php**: This is the main entry point for the website. This is the starting point of the application when a user accesses the website. This is a must if the webiste is to be deployed on a server.  

## Deploying the Website

To deploy the website, follow these general steps:

1. Clone the repository to your server.
2. Set up the necessary server configurations (e.g., web server, PHP, etc.), this depends on the server provider.
5. Point your web server to the `index.php` file as the entry point.
