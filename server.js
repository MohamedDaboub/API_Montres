const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());


const db = new sqlite3.Database('./database/MontreDB.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database');
  }
});

app.get('/', (req, res) => {
    res.redirect('/Montres');
});

app.get('/Montres', (req, res) => {
    db.all('SELECT * FROM Montres', (err, rows) => {
        if (err) {
            console.error('Error fetching montres:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of montres as JSON response
    }
    );
});
app.get('/Montres/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Montres WHERE id_Montre = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching montre:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Montre not found' });
            return;
        }
        res.json(row); // Return the montre as JSON response
    });
});

app.get('/Montres/Utilisateurs/:id', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM Montres WHERE id_Utilisateur = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error fetching montres:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of montres as JSON response
    }
    );
});
app.post('/Montres/add', (req, res) => {
    const { id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form } = req.body;
  
    if (!id_Utilisateur || !id_boitier || !id_pierres || !id_bracelet || !Boitiers_Form) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
  
    db.get('SELECT * FROM Utilisateurs WHERE id_Utilisateur = ?', [id_Utilisateur], (err, user) => {
      if (err) {
        console.error('Error checking user existence:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      db.get('SELECT * FROM Boitiers WHERE boitier_image_url = ?', [id_boitier], (err, boitier) => {
        if (err) {
          console.error('Error checking watch case existence:', err.message);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        if (!boitier) {
          res.status(404).json({ error: 'watch case not found' });
          return;
        }
        // Check if the stones exist
        db.get('SELECT * FROM Pierres WHERE nom_pierres = ?', [id_pierres], (err, pierres) => {
            if (err) {
              console.error('Error checking stones existence:', err.message);
              res.status(500).json({ error: 'Internal server error' });
              return;
            }
          
            // console.log('pierres:', pierres);
          
            if (!pierres) {
                console.log('pierre:', pierres);
              res.status(404).json({ error: 'Stones not found' });
              return;
            }   
  
          // Check if the bracelet exists
          db.get('SELECT * FROM Bracelet WHERE bracelet_image_url = ?', [id_bracelet], (err, bracelet) => {
            if (err) {
              console.error('Error checking bracelet existence:', err.message);
              res.status(500).json({ error: 'Internal server error' });
              return;
            }
            // console.log('bracelet:', bracelet);
  
            if (!bracelet) {
              res.status(404).json({ error: 'Bracelet not found' });
              return;
            }
  
            // Calculate the total price
            const prix_boitier = boitier.prix_boitier;
            const pierre_prix = pierres.pierre_prix;
            const bracelet_prix = bracelet.bracelet_prix;
            const prix_initial = prix_boitier + pierre_prix + bracelet_prix;
  
            // Insert the new montre into the Montres table
            db.run('INSERT INTO Montres (id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form, Prix_unitaire) VALUES (?, ?, ?, ?, ?, ?)',
              [id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form, prix_initial], function (err) {
                if (err) {
                  console.error('Error adding montre:', err.message);
                  res.status(500).json({ error: 'Internal server error' });
                  return;
                }
                const id_Montre = this.lastID;
                db.run('INSERT INTO Panier (id_Utilisateur, id_Montre, Quantite, Prix_unitaire) VALUES (?, ?, ?, ?)',
                  [id_Utilisateur, id_Montre, 1, prix_initial], (err) => {
                    if (err) {
                      console.error('Error adding montre to Panier:', err.message);
                      res.status(500).json({ error: 'Internal server error' });
                      return;
                    }
                    res.json({ id_Utilisateur, id_Montre, id_boitier, id_pierres, id_bracelet, Boitiers_Form, prix_initial });
                  });
              });
          });
        });
      });
    });
  });

app.put('/Montres/edit/:id', (req, res) => {
    const id_Montre = req.params.id;
    const { id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form } = req.body;
  
    if (!id_Utilisateur || !id_boitier || !id_pierres || !id_bracelet || !Boitiers_Form) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
  
    db.get('SELECT * FROM Montres WHERE id_Montre = ?', [id_Montre], (err, montre) => {
      if (err) {
        console.error('Error checking watch existence:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      if (!montre) {
        res.status(404).json({ error: 'Watch not found' });
        return;
      }
  
      // You can perform additional checks if needed, such as user authorization.
  
      // Recalculate the total price
      db.get('SELECT * FROM Boitiers WHERE boitier_image_url = ?', [id_boitier], (err, boitier) => {
        // Similar checks for pierres and bracelet...
        if (err) {
          console.error('Error checking watch case existence:', err.message);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        if (!boitier) {
          res.status(404).json({ error: 'Watch case not found' });
          return;
        }
  
        const prix_boitier = boitier.prix_boitier;
  
        // Check if the stones exist
        db.get('SELECT * FROM Pierres WHERE nom_pierres = ?', [id_pierres], (err, pierre) => {
          if (err) {
            console.error('Error checking stones existence:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
  
          if (!pierre) {
            res.status(404).json({ error: 'Stones not found' });
            return;
          }
  
          const pierre_prix = pierre.pierre_prix;
  
          // Check if the bracelet exists
          db.get('SELECT * FROM Bracelet WHERE bracelet_image_url = ?', [id_bracelet], (err, bracelet) => {
            if (err) {
              console.error('Error checking bracelet existence:', err.message);
              res.status(500).json({ error: 'Internal server error' });
              return;
            }
  
            if (!bracelet) {
              res.status(404).json({ error: 'Bracelet not found' });
              return;
            }
  
            const bracelet_prix = bracelet.bracelet_prix;
            const prix_initial = prix_boitier + pierre_prix + bracelet_prix;
  
            // Update the montre in the Montres table
            db.run('UPDATE Montres SET id_Utilisateur = ?, id_boitier = ?, id_pierres = ?, id_bracelet = ?, Boitiers_Form = ?, Prix_unitaire = ? WHERE id_Montre = ?',
              [id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form, prix_initial, id_Montre], function (err) {
                if (err) {
                  console.error('Error updating montre:', err.message);
                  res.status(500).json({ error: 'Internal server error' });
                  return;
                }
  
                // Update the price in the Panier table
                db.run('UPDATE Panier SET Prix_unitaire = ? WHERE id_Montre = ?', [prix_initial, id_Montre], (err) => {
                  if (err) {
                    console.error('Error updating Panier:', err.message);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                  }
  
                  res.json({ id_Montre, id_Utilisateur, id_boitier, id_pierres, id_bracelet, Boitiers_Form, prix_initial });
                });
              });
          });
        });
      });
    });
  });

app.delete('/Montres/:id/delete', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Montres WHERE id_Montre = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting montre:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        db.run('DELETE FROM Panier WHERE id_Montre = ?', [id], function (errPanier) {
            if (errPanier) {
                console.error('Error deleting montre from Panier:', errPanier.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ message: 'Montre and corresponding entry in Panier deleted successfully' });
        });
    });
});

app.get('/Utilisateurs', (req, res) => {
    db.all('SELECT * FROM Utilisateurs', (err, rows) => {
        if (err) {
            console.error('Error fetching utilisateurs:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of utilisateurs as JSON response
    }
    );
});

app.get('/Utilisateurs/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Utilisateurs WHERE id_Utilisateur = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching utilisateur:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Utilisateur not found' });
            return;
        }
        res.json(row); // Return the utilisateur as JSON response
    });
});

app.get('/Utilisateurs/:id/Montres', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM Montres WHERE id_Utilisateur = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error fetching montres:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of montres as JSON response
    }
    );
});

app.post('/Utilisateurs/add', (req, res) => {
    const { Nom_Utilisateur, Email_utilisateur, password } = req.body;
    // Check if the utilisateur name is provided
    if (!Nom_Utilisateur) {
        res.status(400).json({ error: 'Utilisateur name is required' });
        return;
    }
    // Insert the new utilisateur into the Utilisateurs table
    db.run('INSERT INTO Utilisateurs (Nom_Utilisateur, Email_utilisateur, password) VALUES (?, ?, ?)', [Nom_Utilisateur, Email_utilisateur, password], function (err) {
        if (err) {
            console.error('Error adding utilisateur:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        // Return the newly added utilisateur with its ID
        res.json({ id_Utilisateur: this.lastID, Nom_Utilisateur, Email_utilisateur, password });
    });
});

app.put('/Utilisateurs/:id', (req, res) => {
    const { id } = req.params;
    const updatedUtilisateur = req.body;
    // Check if the updated utilisateur data is provided
    if (!updatedUtilisateur) {
        res.status(400).json({ error: 'Updated utilisateur data is required' });
        return;
    }
    // Construct the SQL query dynamically based on the provided data
    let updateQuery = 'UPDATE Utilisateurs SET ';
    const updateParams = [];
    const validAttributes = ['Nom_Utilisateur', 'Email_utilisateur'];
    for (const attribute in updatedUtilisateur) {
        if (validAttributes.includes(attribute)) {
            // Check if the value is not empty before adding it to the query
            if (updatedUtilisateur[attribute] !== undefined && updatedUtilisateur[attribute] !== '') {
                updateQuery += `${attribute} = ?, `;
                updateParams.push(updatedUtilisateur[attribute]);
            }
        }
    }
    // Remove the trailing comma and space from the query
    updateQuery = updateQuery.slice(0, -2);
    // Add the WHERE clause to specify the utilisateur to update
    updateQuery += ' WHERE id_Utilisateur = ?';
    updateParams.push(id);
    // Execute the dynamic SQL update query
    db.run(updateQuery, updateParams, function (err) {
        if (err) {
            console.error('Error updating utilisateur:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            // No rows were affected, indicating that the utilisateur with the given ID was not found
            res.status(404).json({ error: 'Utilisateur not found' });
        } else {
            // Utilisateur updated successfully
            res.json({ message: 'Utilisateur updated successfully' });
        }
    });
});

app.delete('/Utilisateurs/:id/delete', (req, res) => {
    const { id } = req.params;
    // Execute the SQL delete query
    db.run('DELETE FROM Utilisateurs WHERE id_Utilisateur = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting utilisateur:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            // No rows were affected, indicating that the utilisateur was not found
            res.status(404).json({ error: 'Utilisateur not found' });
        } else {
            // Utilisateur deleted successfully
            res.json({ message: 'Utilisateur deleted successfully' });
        }
    });
});
app.get('/Panier', (req, res) => {
    db.all('SELECT * FROM Panier', (err, rows) => {
        if (err) {
            console.error('Error fetching panier:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of panier as JSON response
    }
    );
});

app.get('/Panier/:id', (req, res) => {
    // Extract the user ID from the request parameters
    const { id } = req.params;

    // Query the database to get all products in the user's shopping cart
    db.all('SELECT * FROM Panier WHERE id_Utilisateur = ?', [id], (err, rows) => {
        if (err) {
            // Handle any database error
            console.error('Error fetching panier:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (!rows || rows.length === 0) {
            // If the shopping cart is empty or not found, return a 404 response with a specific message
            res.status(404).json({ error: 'Panier vide' });
            return;
        }

        // Return the user's shopping cart as a JSON response
        res.json(rows);
    });
});

app.delete('/Panier/:id/delete', (req, res) => {
    const { id } = req.params;
    // Execute the SQL delete query
    db.run('DELETE FROM Panier WHERE id_Montre = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting montre:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            // No rows were affected, indicating that the montre was not found
            res.status(404).json({ error: 'Montre not found' });
        } else {
            // Montre deleted successfully
            res.json({ message: 'Montre deleted successfully' });
        }
    });
});

app.get('/Boitiers', (req, res) => {
    db.all('SELECT * FROM Boitiers', (err, rows) => {
        if (err) {
            console.error('Error fetching boitiers:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of boitiers as JSON response
    }
    );
});
app.put('/Boitiers/:id', (req, res) => {
    const { id } = req.params;
    const updatedBoitier = req.body;
  
    // Check if the updated boitier data is provided
    if (!updatedBoitier) {
        res.status(400).json({ error: 'Updated boitier data is required' });
        return;
    }
  
    // Retrieve the updated price of the boitier
    const newBoitierPrice = updatedBoitier.prix_boitier;
  
    // Construct the SQL query dynamically based on the provided data
    let updateQuery = 'UPDATE Boitiers SET prix_boitier = ? WHERE id_boitier = ?';
  
    // Execute the dynamic SQL update query to update the boitier price
    db.run(updateQuery, [newBoitierPrice, id], function (err) {
        if (err) {
            console.error('Error updating boitier:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
  
        if (this.changes === 0) {
            // No rows were affected, indicating that the boitier with the given ID was not found
            res.status(404).json({ error: 'Boitier not found' });
            return;
        }
  
        // Update the Prix_unitaire in the Panier table for Montres entries with the specified boitier
        const updatePanierQuery = `
            UPDATE Panier
            SET Prix_unitaire = (SELECT Boitiers.prix_boitier FROM Boitiers WHERE id_boitier = ?) +
                            (SELECT Pierres.pierre_prix FROM Montres
                             JOIN Pierres ON Montres.id_pierres = Pierres.id_pierres
                             WHERE Montres.id_boitier = ?) +
                            (SELECT Bracelet.bracelet_prix FROM Montres
                             JOIN Bracelet ON Montres.id_bracelet = Bracelet.id_bracelet
                             WHERE Montres.id_boitier = ?)
            WHERE id_Montre IN (SELECT id_Montre FROM Montres WHERE id_boitier = ?);
        `;
  
        // Execute the dynamic SQL update query to update Prix_unitaire in the Panier table
        db.run(updatePanierQuery, [id, id, id, id], function (err) {
            if (err) {
                console.error('Error updating Panier:', err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
  
            // Boitier updated successfully
            res.json({ message: 'Boitier updated successfully' });
        });
    });
  });
app.get('/Pierres', (req, res) => {
    db.all('SELECT * FROM Pierres', (err, rows) => {
        if (err) {
            console.error('Error fetching pierres:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of pierres as JSON response
    }
    );
});
app.put('/Pierres/:id', (req, res) => {
    const { id } = req.params;
    const updatedPierre = req.body;
  
    // Check if the updated pierre data is provided
    if (!updatedPierre) {
        res.status(400).json({ error: 'Updated pierre data is required' });
        return;
    }
  
    // Retrieve the updated price of the pierre
    const newPierrePrice = updatedPierre.pierre_prix;
  
    // Construct the SQL query dynamically based on the provided data
    let updateQuery = 'UPDATE Pierres SET pierre_prix = ? WHERE id_pierres = ?';
  
    // Execute the dynamic SQL update query to update the pierre price
    db.run(updateQuery, [newPierrePrice, id], function (err) {
        if (err) {
            console.error('Error updating pierre:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
  
        if (this.changes === 0) {
            // No rows were affected, indicating that the pierre with the given ID was not found
            res.status(404).json({ error: 'Pierre not found' });
            return;
        }
  
        // Update the Prix_unitaire in the Panier table for Montres entries with the specified pierre
        const updatePanierQuery = `
            UPDATE Panier
            SET Prix_unitaire = (SELECT Boitiers.prix_boitier FROM Montres
                             JOIN Boitiers ON Montres.id_boitier = Boitiers.id_boitier
                             WHERE Montres.id_pierres = ?) +
                            (SELECT Pierres.pierre_prix FROM Pierres WHERE id_pierres = ?) +
                            (SELECT Bracelet.bracelet_prix FROM Montres
                             JOIN Bracelet ON Montres.id_bracelet = Bracelet.id_bracelet
                             WHERE Montres.id_pierres = ?)
            WHERE id_Montre IN (SELECT id_Montre FROM Montres WHERE id_pierres = ?);
        `;
  
        // Execute the dynamic SQL update query to update Prix_unitaire in the Panier table
        db.run(updatePanierQuery, [id, id, id, id], function (err) {
            if (err) {
                console.error('Error updating Panier:', err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
  
            // Pierre updated successfully
            res.json({ message: 'Pierre updated successfully' });
        });
    });
  });
app.get('/Bracelet', (req, res) => {
    db.all('SELECT * FROM Bracelet', (err, rows) => {
        if (err) {
            console.error('Error fetching bracelet:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of bracelet as JSON response
    }
    );
});

app.put('/Bracelet/:id', (req, res) => {
    const { id } = req.params;
    const updatedBracelet = req.body;

    // Check if the updated bracelet data is provided
    if (!updatedBracelet) {
        res.status(400).json({ error: 'Updated bracelet data is required' });
        return;
    }

    // Retrieve the updated price and name of the bracelet
    const newBraceletPrice = updatedBracelet.bracelet_prix;
    const newBraceletName = updatedBracelet.nom_bracelet;

    // Construct the SQL query dynamically based on the provided data
    let updateQuery = 'UPDATE Bracelet SET bracelet_prix = ?, nom_bracelet = ? WHERE id_bracelet = ?';

    // Execute the dynamic SQL update query to update the bracelet price and name
    db.run(updateQuery, [newBraceletPrice, newBraceletName, id], function (err) {
        if (err) {
            console.error('Error updating bracelet:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (this.changes === 0) {
            // No rows were affected, indicating that the bracelet with the given ID was not found
            res.status(404).json({ error: 'Bracelet not found' });
            return;
        }

        // Update the PrixTotal in the Panier table for Montres entries with the specified bracelet
        const updatePanierQuery = `
            UPDATE Panier
            SET Prix_unitaire = (SELECT Boitiers.prix_boitier FROM Montres
                             JOIN Boitiers ON Montres.id_boitier = Boitiers.id_boitier
                             WHERE Montres.id_bracelet = ?) +
                            (SELECT Pierres.pierre_prix FROM Montres
                             JOIN Pierres ON Montres.id_pierres = Pierres.id_pierres
                             WHERE Montres.id_bracelet = ?) +
                            (SELECT Bracelet.bracelet_prix FROM Bracelet WHERE id_bracelet = ?)
            WHERE id_Montre IN (SELECT id_Montre FROM Montres WHERE id_bracelet = ?);
        `;

        // Execute the dynamic SQL update query to update PrixTotal in the Panier table
        db.run(updatePanierQuery, [id, id, id, id], function (err) {
            if (err) {
                console.error('Error updating Panier:', err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Bracelet updated successfully
            res.json({ message: 'Bracelet updated successfully' });
        });
    });
});
app.post('/Utilisateurs/login', (req, res) => {
    const { Email_utilisateur, password } = req.body;
  
    // Check if the utilisateur name is provided
    if (!Email_utilisateur || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
  
    // Check if the utilisateur exists
    db.get('SELECT id_Utilisateur, nom_Utilisateur FROM Utilisateurs WHERE Email_utilisateur = ? AND password = ?', [Email_utilisateur, password], (err, utilisateur) => {
        if (err) {
            console.error('Error checking utilisateur existence:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
  
        if (!utilisateur) {
            res.status(404).json({ error: 'Email or password is incorrect' });
            return;
        }
  
        // Return the utilisateur ID and name
        res.json({ id_Utilisateur: utilisateur.id_Utilisateur, nom_Utilisateur: utilisateur.nom_Utilisateur });
    });
  });
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
