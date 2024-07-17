# Inference Management System for Sleep Apnea Syndrome

## Obiettivo del progetto
Il progetto consiste nella realizzazione di un backend per la gestione delle inferenze fatte su immagini (con estensione .png) di spettrogrammi o su cartelle zip, tramite l'utilizzo di due modelli di Deep-Learning pre-addestrati per l'individuazione di apnee notturne.
I modelli messi a disposizione sono stati addestrati su un diverso numero di pazienti, in particolare uno su 10 e l'altro su 20, il che risulta in prestazioni differenti.
Il backend realizzato permette agli utenti di autenticarsi, generare dataset e fare infereza su questi ultimi, nei quali possono essere inserite sia immagini che cartelle zip. Le operazioni di inferenza e l'aggiunta di materiale multimediale sono consentite agli utenti
a condizione che dispongano di un numero sufficiente di token. Quando uno degli utenti esaurisce i token a disposizione, può richiederne all'admin. Il tutto è gestito da un sistema di autenticazione JWT (JSON Web Token).

## Progettazione Database
Il server trova appoggio in un database PostgreSQL, impostato su un server esterno. Le credenziali di accesso, come nome del database, utente, password ed hosto, sono salvate come variabuli di ambiente.
il batabase è formato da tre entità: datasets, spectrograms e Utente, ciascuno con i propri attributi.
Di seguito riportiamo il diagramma relazionale utilizato per la progettazione del database:

<p align="center">
    <img src="./diagrammi/DiagrammaRelazionale.drawio.png" alt="Diagramma del Sistema">
</p>

## Diagrammi dei Casi D'Uso
Utilizziamo i diagrammi dei casi d'uso per poter identificare in maniera chiara gli attori che interagiscono con il sistema e descrivere tale interazioni; inoltre, essi ci forniscono una panoramica chiara delle funzionalità del sistema stesso.


## Diagrammi delle Sequenze

## Design Pattern Utilizzati
Descrizione dei design pattern utilizzati nel progetto.
