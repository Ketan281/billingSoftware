const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      // Initialize tables
      db.run(
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          name TEXT NOT NULL, 
          phone TEXT NOT NULL, 
          duePayment REAL NOT NULL DEFAULT 0,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          history TEXT []
        )`,
        (err) => {
          if (err) {
            console.error('Error creating customers table:', err.message);
          } else {
            console.log('Customers table initialized.');
          }
        }
      );
  
      // Add the customer_history table creation here
      db.run(
        `CREATE TABLE IF NOT EXISTS customer_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER NOT NULL,
          date TEXT NOT NULL,
          quantity REAL,
          weight REAL,
          rate REAL,
          payment REAL,
          duePayment REAL,
          totalPayment REAL,
          creditPayment REAL,
          totalDuePayment REAL,
          FOREIGN KEY (customerId) REFERENCES customers (id)
        )`,
        (err) => {
          if (err) {
            console.error('Error creating customer_history table:', err.message);
          } else {
            console.log('Customer history table initialized.');
          }
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          liftingRate REAL,
          liftingCompanyName TEXT,
          driverName TEXT,
          cleanerName TEXT,
          rows TEXT, -- Store the rows as JSON
          totals TEXT -- Store the totals as JSON
        )`,
        (err) => {
          if (err) {
            console.error('Error creating bills table:', err.message);
          } else {
            console.log('Bills table initialized.');
          }
        }
      );
      // Create a new table for additional fields
db.run(
    `CREATE TABLE IF NOT EXISTS bills_extra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billId INTEGER, -- Foreign key linking to the bills table
        morgavRate REAL,
        liftingWeight REAL,
        notes TEXT,
        cashTotal REAL,
        expenses TEXT,
        additionalTip TEXT,
        FOREIGN KEY (billId) REFERENCES bills (id)
    )`,
    (err) => {
      if (err) {
        console.error('Error creating bills_extra table:', err.message);
      } else {
        console.log('Bills_extra table initialized.');
      }
    }
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS bills_extra1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billId INTEGER, -- Foreign key linking to the bills table
        morgavRate REAL,
        liftingWeight REAL,
        notes TEXT,
        cashTotal REAL,
        notes500 INTEGER,
        notes200 INTEGER,
        notes100 INTEGER,
        notes50 INTEGER,
        notes20 INTEGER,
        notes10 INTEGER,
        expenses TEXT,
        additionalTip TEXT,
        FOREIGN KEY (billId) REFERENCES bills (id)
    )`,
    (err) => {
      if (err) {
        console.error('Error creating bills_extra table:', err.message);
      } else {
        console.log('Bills_extra table initialized.');
      }
    }
  );
  
    }
  });
  
// Fetch all customers
app.get('/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const formattedRows = rows.map((row) => ({
        ...row,
        timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
      }));
      res.json(formattedRows);
    }
  });
});

// Add a new customer
app.post('/customers', (req, res) => {
  const { name, phone, duePayment } = req.body;
  const timestamp = new Date().toISOString();
  db.run(
    'INSERT INTO customers (name, phone, duePayment, timestamp) VALUES (?, ?, ?, ?)',
    [name, phone, duePayment || 0, timestamp],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json({ id: this.lastID, name, phone, duePayment, timestamp });
      }
    }
  );
});

// Search customers by name
app.get('/customers/search', (req, res) => {
  const { query } = req.query;
  db.all(
    'SELECT name FROM customers WHERE name LIKE ? LIMIT 10',
    [`%${query}%`],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(rows);
      }
    }
  );
});

// Update a customer's due payment
app.post('/customers/update-due', (req, res) => {
  const { name, duePayment } = req.body;
  db.run(
    'UPDATE customers SET duePayment = ? WHERE name = ?',
    [duePayment, name],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// Delete a customer by ID
app.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM customers WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/bills', (req, res) => {
    const {
        date,
        liftingRate,
        liftingCompanyName,
        driverName,
        cleanerName,
        rows,
        totals,
        morgavRate,
        liftingWeight,
        notes,
        cashTotal,
        expenses,
        additionalTip,
    } = req.body;

    const serializedRows = JSON.stringify(rows);
    const serializedTotals = JSON.stringify(totals);

    // Check if a bill already exists for the same date
    db.get(
        'SELECT * FROM bills WHERE date = ?',
        [date],
        (err, existingBill) => {
            if (err) {
                console.error('Error checking for existing bill:', err.message);
                return res.status(500).send('Failed to save bill.');
            }

            if (existingBill) {
                // Update the existing bill
                db.run(
                    `UPDATE bills 
                     SET liftingRate = ?, liftingCompanyName = ?, driverName = ?, cleanerName = ?, rows = ?, totals = ?
                     WHERE date = ?`,
                    [
                        liftingRate,
                        liftingCompanyName,
                        driverName,
                        cleanerName,
                        serializedRows,
                        serializedTotals,
                        date,
                    ],
                    function (updateErr) {
                        if (updateErr) {
                            console.error('Error updating bill:', updateErr.message);
                            return res.status(500).send('Failed to update bill.');
                        }
                        saveAdditionalFields(existingBill.id, req.body, res);
                        updateCustomerHistories(rows, date, res);
                    }
                );
            } else {
                // Insert a new bill if no existing entry is found
                db.run(
                    `INSERT INTO bills (date, liftingRate, liftingCompanyName, driverName, cleanerName, rows, totals)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        date,
                        liftingRate,
                        liftingCompanyName,
                        driverName,
                        cleanerName,
                        serializedRows,
                        serializedTotals,
                    ],
                    function (insertErr) {
                        if (insertErr) {
                            console.error('Error saving bill:', insertErr.message);
                            return res.status(500).send('Failed to save bill.');
                        }
                        saveAdditionalFields(this.lastID, req.body, res);
                        updateCustomerHistories(rows, date, res);
                    }
                );
            }
        }
    );
});

const saveAdditionalFields = (billId, data, res) => {
    const {
        morgavRate,
        liftingWeight,
        notes,
        expenses,
        additionalTip,
        cashCounts = {}, // Default to an empty object if not provided
    } = data;
    // console.log(data,"&&&&")
    // Ensure cashCounts has valid keys
    const validCashCounts = {
        500: parseInt(cashCounts[500]) || 0,
        200: parseInt(cashCounts[200]) || 0,
        100: parseInt(cashCounts[100]) || 0,
        50: parseInt(cashCounts[50]) || 0,
        20: parseInt(cashCounts[20]) || 0,
        10: parseInt(cashCounts[10]) || 0,
    };
    console.log(validCashCounts,">>>>>")
    // Calculate total cash based on note counts
    const cashTotal = Object.entries(validCashCounts).reduce(
        (sum, [denomination, count]) => sum + denomination * count,
        0
    );

    db.run(
        `INSERT INTO bills_extra1 (
            billId, morgavRate, liftingWeight, notes, cashTotal,
            notes500, notes200, notes100, notes50, notes20, notes10, 
            expenses, additionalTip
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            billId,
            morgavRate || 0,
            liftingWeight || 0,
            notes || "",
            cashTotal || 0,
            validCashCounts[500],
            validCashCounts[200],
            validCashCounts[100],
            validCashCounts[50],
            validCashCounts[20],
            validCashCounts[10],
            expenses || "",
            additionalTip || "",
        ],
        (extraErr) => {
            if (extraErr) {
                console.error("Error saving additional fields:", extraErr.message);
                return res.status(500).send("Failed to save additional fields.");
            }
            console.log("Additional fields saved successfully.");
        }
    );
};


// Helper function to update customer histories
const updateCustomerHistories = (rows, date, res) => {
    rows.forEach((row) => {
        const {
            customerName,
            quantity,
            weight,
            rate,
            payment,
            duePayment,
            totalPayment,
            creditPayment,
            totalDuePayment,
        } = row;

        db.get(
            'SELECT * FROM customers WHERE name = ?',
            [customerName],
            (err, customer) => {
                if (err) {
                    console.error('Error fetching customer:', err.message);
                    return;
                }

                if (customer) {
                    const historyEntry = {
                        date,
                        quantity,
                        weight,
                        rate,
                        payment,
                        duePayment,
                        totalPayment,
                        creditPayment,
                        totalDuePayment,
                    };

                    const updatedHistory = [
                        ...(JSON.parse(customer.history || '[]')),
                        historyEntry,
                    ];

                    db.run(
                        'UPDATE customers SET history = ?, duePayment = ? WHERE id = ?',
                        [JSON.stringify(updatedHistory), totalDuePayment, customer.id],
                        (updateErr) => {
                            if (updateErr) {
                                console.error(
                                    'Error updating customer history:',
                                    updateErr.message
                                );
                            } else {
                                console.log(`Customer history updated for ${customerName}`);
                            }
                        }
                    );
                } else {
                    console.error(`Customer ${customerName} not found. Unable to update history.`);
                }
            }
        );
    });
};
app.get('/bills-extra/:date', (req, res) => {
    const { date } = req.params;
  
    db.get(
      `SELECT * FROM bills_extra1 
       INNER JOIN bills ON bills_extra1.billId = bills.id 
       WHERE bills.date = ?`,
      [date],
      (err, row) => {
        if (err) {
          console.error('Error fetching bills_extra:', err.message);
          return res.status(500).send('Failed to fetch additional bill details.');
        }
        res.status(200).send(row || {});
      }
    );
  });
  

// Fetch detailed bill for a specific date
app.get('/bills/:date', (req, res) => {
    const { date } = req.params;
  
    db.all('SELECT * FROM bills WHERE date = ?', [date], (err, rows) => {
      if (err) {
        console.error('Error fetching bills:', err.message);
        return res.status(500).send({ error: 'Error fetching bills.' });
      }
  
      const bills = rows.map((row) => {
        const parsedRows = JSON.parse(row.rows || '[]'); // Parse JSON safely
        return {
          ...row,
          rows: parsedRows,
          totals: JSON.parse(row.totals || '{}'),
        };
      });
  
      res.json(bills);
    });
  });
  
  app.get('/bills', (req, res) => {
    db.all('SELECT id, date FROM bills ORDER BY date DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching bills', message: err.message });
      }
      res.json(rows);
    });
  });

  
  app.put('/bills/update-row', (req, res) => {
    const { date, updatedRow } = req.body;
  
    db.get('SELECT * FROM bills WHERE date = ?', [date], (err, bill) => {
      if (err) {
        console.error('Error fetching bill:', err.message);
        return res.status(500).send({ error: 'Error fetching bill.' });
      }
  
      if (!bill) {
        return res.status(404).send({ error: 'Bill not found.' });
      }
  
      const rows = JSON.parse(bill.rows);
      const rowIndex = rows.findIndex(row => row.customerName === updatedRow.customerName);
  
      if (rowIndex === -1) {
        return res.status(404).send({ error: 'Row not found.' });
      }
  
      rows[rowIndex] = updatedRow;
  
      db.run(
        'UPDATE bills SET rows = ? WHERE date = ?',
        [JSON.stringify(rows), date],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating bill:', updateErr.message);
            return res.status(500).send({ error: 'Error updating bill.' });
          }
  
          res.status(200).send({ message: 'Row updated successfully.' });
        }
      );
    });
  });
  
  
// Fetch detailed history for a customer
app.get('/customers/:id/history', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM bills WHERE JSON_EXTRACT(rows, "$[*].customerName") LIKE ?',` [%${id}%]`, (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(rows.map(row => ({
          ...row,
          rows: JSON.parse(row.rows),
          totals: JSON.parse(row.totals),
        })));
      }
    });
  });
  // Save customer entry to history
  app.post('/customers/:name/save-entry', (req, res) => {
    const { name } = req.params;
    const { date, quantity, weight, rate, payment, duePayment, totalPayment, creditPayment, totalDuePayment } = req.body;
  
    // Get customer ID by name
    db.get('SELECT id FROM customers WHERE name = ?', [name], (err, customer) => {
      if (err) {
        console.error('Error fetching customer ID:', err.message);
        return res.status(500).send('Failed to fetch customer ID.');
      }
  
      if (customer) {
        const customerId = customer.id;
  
        // Save the entry to the history
        db.run(
          `INSERT INTO customer_history (
            customerId, date, quantity, weight, rate, payment, duePayment, totalPayment, creditPayment, totalDuePayment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            date,
            quantity,
            weight,
            rate,
            payment,
            duePayment,
            totalPayment,
            creditPayment,
            totalDuePayment,
          ],
          (err) => {
            if (err) {
              console.error('Error saving customer history:', err.message);
              return res.status(500).send('Failed to save entry to history.');
            }
  
            res.status(200).send('Entry saved to customer history.');
          }
        );

      } else {
        res.status(404).send('Customer not found.');
      }
    });
  });
  
  app.delete('/delete-all-data', (req, res) => {
    // Delete all data from customers, bills, and customer_history tables
    db.serialize(() => {
      db.run('DELETE FROM customers', (err) => {
        if (err) {
          console.error('Error deleting customers:', err.message);
          return res.status(500).send('Failed to delete customers.');
        }
      });
  
      db.run('DELETE FROM bills', (err) => {
        if (err) {
          console.error('Error deleting bills:', err.message);
          return res.status(500).send('Failed to delete bills.');
        }
      });
  
      db.run('DELETE FROM customer_history', (err) => {
        if (err) {
          console.error('Error deleting customer history:', err.message);
          return res.status(500).send('Failed to delete customer history.');
        }
      });
  
      res.status(200).send('All data deleted successfully.');
    });
  });

  app.get('/customers/:id/history', (req, res) => {
    const customerId = parseInt(req.params.id, 10);

    // Validate input
    if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID format.' });
    }

    const query = 
        `SELECT 
            c.id AS customerId,
            c.name AS customerName,
            c.phone AS customerPhone,
            c.duePayment AS customerDuePayment,
            c.timestamp AS customerTimestamp,
            ch.id AS historyId,
            ch.date,
            ch.quantity,
            ch.weight,
            ch.rate,
            ch.payment,
            ch.duePayment AS historyDuePayment,
            ch.totalPayment,
            ch.creditPayment,
            ch.totalDuePayment
        FROM customers c
        LEFT JOIN customer_history ch ON c.id = ch.customerId
        WHERE c.id = ?
        ORDER BY ch.date DESC`
    ;

    db.all(query, [customerId], (err, rows) => {
        if (err) {
            console.error('Database query failed:', err.message);
            return res.status(500).json({ error: 'Database Error', message: err.message });
        }

        // Check if the customer exists
        if (!rows || rows.length === 0 || rows[0].customerId === null) {
            return res.status(404).json({ message: 'Customer not found or has no history.' });
        }

        // Extract customer details
        const customer = {
            id: rows[0].customerId,
            name: rows[0].customerName,
            phone: rows[0].customerPhone,
            duePayment: rows[0].customerDuePayment,
            timestamp: rows[0].customerTimestamp,
        };

        // Extract history, if available
        const history = rows
            .filter(row => row.historyId !== null) // Exclude empty history rows
            .map(row => ({
                id: row.historyId,
                date: row.date,
                quantity: row.quantity,
                weight: row.weight,
                rate: row.rate,
                payment: row.payment,
                duePayment: row.historyDuePayment,
                totalPayment: row.totalPayment,
                creditPayment: row.creditPayment,
                totalDuePayment: row.totalDuePayment,
            }));

        // Return combined response
        res.json({ customer, history });
    });
});


  
// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});