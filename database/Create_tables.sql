CREATE TABLE Utilisateurs (
    id_Utilisateur INTEGER PRIMARY KEY,
    Nom_Utilisateur VARCHAR(255) NOT NULL,
    Email_utilisateur VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE Montres (
    id_Utilisateur INTEGER,
    id_Montre INTEGER PRIMARY KEY,
    id_boitier INTEGER,
    id_pierres INTEGER,
    id_bracelet INTEGER,
    Boitiers_Form TEXT,
    Prix_unitaire FLOAT NOT NULL,
    CreeLe DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_boitier) REFERENCES Boitiers(id_boitier),
    FOREIGN KEY (id_pierres) REFERENCES Pierres(id_pierres),
    FOREIGN KEY (id_bracelet) REFERENCES Bracelet(id_bracelet),
    FOREIGN KEY (id_Utilisateur) REFERENCES Utilisateurs(id_Utilisateur)
);
CREATE TABLE Boitiers (
    id_boitier INTEGER PRIMARY KEY,
    nom_boitier TEXT NOT NULL,
    prix_boitier FLOAT NOT NULL,
    boitier_image_url TEXT,
);
CREATE TABLE Pierres (
    id_pierres INTEGER PRIMARY KEY,
    nom_pierres TEXT NOT NULL,
    pierre_prix FLOAT NOT NULL
);
CREATE TABLE Bracelet (
    id_bracelet INTEGER PRIMARY KEY,
    nom_bracelet TEXT NOT NULL,
    bracelet_prix FLOAT NOT NULL,
    bracelet_image_url TEXT
);
CREATE TABLE Panier (
    id_Utilisateur INTEGER,
    id_Montre INTEGER,
    Quantite INTEGER NOT NULL,
    Prix_unitaire FLOAT NOT NULL,
    FOREIGN KEY (id_Utilisateur) REFERENCES Utilisateurs(id_Utilisateur),
    FOREIGN KEY (id_Montre) REFERENCES Montres(id_Montre),
    FOREIGN KEY (Prix_unitaire) REFERENCES Montres(Prix_unitaire)
);