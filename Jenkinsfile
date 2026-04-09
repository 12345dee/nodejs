pipeline {
    agent any
    environment {
        IMAGE_NAME = "deepak37/devops-node-app"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('Clone Code') {
            steps {
                git branch: 'dev', url: 'https://github.com/12345dee/nodejs.git'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        def appImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                        appImage.push()
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
