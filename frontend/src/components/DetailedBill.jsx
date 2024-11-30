import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Paper,
  Divider,
  Button,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DetailedBill = () => {
  const { date } = useParams();
  const [detailedBill, setDetailedBill] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedRow, setEditedRow] = useState(null);
  const [totals, setTotals] = useState({
    quantity: 0,
    weight: 0,
    payment: 0,
    duePayment: 0,
    totalPayment: 0,
    creditPayment: 0,
    totalDuePayment: 0,
  });
  const navigate = useNavigate();

  const [billsExtra, setBillsExtra] = useState(null);

  useEffect(() => {
    const fetchDetailedBill = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/bills/${date}`);
        const bill = response.data[0];
        setDetailedBill(response.data);
        calculateTotals(bill.rows || JSON.parse(bill.rows));
      } catch (error) {
        console.error("Error fetching detailed bill:", error);
      }
    };

    const fetchBillsExtra = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/bills-extra/${date}`
        );
        setBillsExtra(response.data);
      } catch (error) {
        console.error("Error fetching bills extra:", error);
      }
    };

    fetchDetailedBill();
    fetchBillsExtra();
  }, [date]);

  const calculateTotals = (rows) => {
    const newTotals = rows.reduce(
      (acc, row) => {
        acc.quantity += parseFloat(row.quantity) || 0;
        acc.weight += parseFloat(row.weight) || 0;
        acc.payment += parseFloat(row.payment) || 0;
        acc.duePayment += parseFloat(row.duePayment) || 0;
        acc.totalPayment += parseFloat(row.totalPayment) || 0;
        acc.creditPayment += parseFloat(row.creditPayment) || 0;
        acc.totalDuePayment += parseFloat(row.totalDuePayment) || 0;
        return acc;
      },
      {
        quantity: 0,
        weight: 0,
        payment: 0,
        duePayment: 0,
        totalPayment: 0,
        creditPayment: 0,
        totalDuePayment: 0,
      }
    );
    setTotals(newTotals);
  };

  const handleEditClick = (index) => {
    if (editIndex === index) {
      axios
        .put(`http://localhost:5000/bills/update-row`, {
          date,
          updatedRow: editedRow,
        })
        .then(() => {
          setDetailedBill((prev) => {
            const updatedBill = { ...prev[0] };
            updatedBill.rows[index] = editedRow;
            calculateTotals(updatedBill.rows);
            toast.success("Row updated successfully!");
            return [updatedBill];
          });
          setEditIndex(null);
          setEditedRow(null);
        })
        .catch((error) => {
          console.error("Error updating row:", error);
          toast.error("Failed to update row.");
        });
    } else {
      setEditIndex(index);
      setEditedRow(rows[index]);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedRow((prev) => {
      const updatedRow = { ...prev, [field]: value };

      const weight = parseFloat(updatedRow.weight) || 0;
      const rate = parseFloat(updatedRow.rate) || 0;
      const duePayment = parseFloat(updatedRow.duePayment) || 0;
      const creditPayment = parseFloat(updatedRow.creditPayment) || 0;

      const payment = weight * rate;
      updatedRow.payment = payment;
      updatedRow.totalPayment = payment + duePayment;
      updatedRow.totalDuePayment = updatedRow.totalPayment - creditPayment;

      const updatedRows = [...detailedBill[0].rows];
      updatedRows[editIndex] = updatedRow;
      calculateTotals(updatedRows);

      return updatedRow;
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Add title
    doc.setFontSize(18);
    doc.text("Momin Chicken Suppliers", 105, 10, { align: "center" });

    // Add Address
    doc.setFontSize(12);
    doc.text(
      "Address: 68|6, Hajaremala, umbraj. Tal-karad, dist-satara, 415109",
      105,
      20,
      { align: "center" }
    );
    doc.text(
      "Prop: Late H. Shabbir A. Momin and Sons",
      105,
      25,
      { align: "center" }
    );
    doc.text("Contact: 9850697429, 9970772324", 105, 30, { align: "center" });

    // Add Detailed Bill info
    doc.setFontSize(14);
    doc.text(`Detailed Bill - ${date}`, 105, 40, { align: "center" });

    // Add Lifting and Driver Info
    doc.setFontSize(12);
    doc.text(`Lifting Rate: ${bill.liftingRate}`, 10, 50);
    doc.text(`Lifting Company: ${bill.liftingCompanyName}`, 10, 55);
    doc.text(`Driver Name: ${bill.driverName}`, 10, 60);
    doc.text(`Cleaner Name: ${bill.cleanerName}`, 10, 65);

    // Add table for rows
    const rowsData = rows.map((row) => [
      row.customerName,
      row.quantity,
      row.weight,
      row.rate,
      row.payment.toFixed(2),
      row.duePayment.toFixed(2),
      row.totalPayment.toFixed(2),
      row.creditPayment,
      row.totalDuePayment.toFixed(2),
    ]);
    const tableHeaders = [
      [
        "Customer Name",
        "Quantity",
        "Weight",
        "Rate",
        "Payment",
        "Due Payment",
        "Total Payment",
        "Credit Payment",
        "Total Due Payment",
      ],
    ];
    doc.autoTable({
      head: tableHeaders,
      body: rowsData,
      startY: 70,
    });

    // Add totals
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.text(`Total Quantity: ${totals.quantity}`, 10, finalY + 10);
    doc.text(`Total Weight: ${totals.weight.toFixed(2)}`, 10, finalY + 15);
    doc.text(`Total Payment: ₹${totals.payment.toFixed(2)}`, 10, finalY + 20);
    doc.text(`Total Due Payment: ₹${totals.duePayment.toFixed(2)}`, 10, finalY + 25);
    doc.text(
      `Total Credit Payment: ₹${totals.creditPayment.toFixed(2)}`,
      10,
      finalY + 30
    );
    doc.text(
      `Total Due Payment: ₹${totals.totalDuePayment.toFixed(2)}`,
      10,
      finalY + 35
    );

    // Add additional information if available
    if (billsExtra) {
      doc.text("Additional Information:", 10, finalY + 45);
      doc.text(`Morgav Rate: ${billsExtra.morgavRate || "-"}`, 10, finalY + 50);
      doc.text(`Additional Tip: ${billsExtra.additionalTip || "-"}`, 10, finalY + 55);
      doc.text(
        `Lifting Weight: ${billsExtra.liftingWeight || "-"}`,
        10,
        finalY + 60
      );
      doc.text(`Notes: ${billsExtra.notes || "-"}`, 10, finalY + 65);
      doc.text(`Expenses: ${billsExtra.expenses || "-"}`, 10, finalY + 70);
      doc.text(
        `Collected Cash Total: ₹${billsExtra.cashTotal || "-"} (500: ${
          billsExtra.notes500 || 0
        }, 200: ${billsExtra.notes200 || 0}, 100: ${
          billsExtra.notes100 || 0
        }, 50: ${billsExtra.notes50 || 0}, 20: ${billsExtra.notes20 || 0}, 10: ${
          billsExtra.notes10 || 0
        })`,
        10,
        finalY + 75
      );
    }

    // Save the PDF
    doc.save(`Detailed_Bill_${date}.pdf`);
  };

  if (detailedBill.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No Bill Found</Typography>
      </Box>
    );
  }

  const bill = detailedBill[0];
  const rows = Array.isArray(bill.rows) ? bill.rows : JSON.parse(bill.rows);

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign={"center"}>
            Momin Chicken Suppliers
          </Typography>
          <Box display={"flex"} gap={9}>
            <Typography
              variant="h6"
              gutterBottom
              textAlign={"center"}
              mt={2}
              mb={2}
            >
              Address:{" "}
              <Typography fontSize={"16px"} display={"inline"}>
                68|6, Hajaremala,umbraj.Tal-karad,dist-satara,415109
              </Typography>
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              textAlign={"center"}
              mt={2}
              mb={2}
            >
              Prop:{" "}
              <Typography fontSize={"16px"} display={"inline"}>
                Late H.shabbir A. Momin and sons
              </Typography>
              <Typography variant="h6">
                Contact No.-{" "}
                <Typography display={"inline"}>9850697429 , 9970772324</Typography>
              </Typography>
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
          >
            Detailed Bill - {date}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Lifting Rate:</strong> {bill.liftingRate}
              </Typography>
              <Typography>
                <strong>Lifting Company:</strong> {bill.liftingCompanyName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Driver Name:</strong> {bill.driverName}
              </Typography>
              <Typography>
                <strong>Cleaner Name:</strong> {bill.cleanerName}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ mb: 4 }}>
        <TableContainer component={Paper}>
          <Table sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {[
                  "Customer Name",
                  "Quantity",
                  "Weight",
                  "Rate",
                  "Payment",
                  "Due Payment",
                  "Total Payment",
                  "Credit Payment",
                  "Total Due Payment",
                  "Actions",
                ].map((header, index) => (
                  <TableCell
                    key={header}
                    sx={{
                      ...(header === "Customer Name" && { width: "15%" }),
                      textAlign: header === "Actions" ? "center" : "left",
                      fontWeight: "bold",
                    }}
                  >
                    <Typography variant="subtitle1">{header}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.customerName}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <TextField
                        value={editedRow.quantity}
                        onChange={(e) =>
                          handleFieldChange("quantity", e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      row.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <TextField
                        value={editedRow.weight}
                        onChange={(e) =>
                          handleFieldChange("weight", e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      row.weight
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <TextField
                        value={editedRow.rate}
                        onChange={(e) =>
                          handleFieldChange("rate", e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      row.rate
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index
                      ? editedRow.payment.toFixed(2)
                      : row.payment.toFixed(2)}
                  </TableCell>
                  <TableCell>{row.duePayment.toFixed(2)}</TableCell>
                  <TableCell>
                    {editIndex === index
                      ? editedRow.totalPayment.toFixed(2)
                      : row.totalPayment.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <TextField
                        value={editedRow.creditPayment}
                        onChange={(e) =>
                          handleFieldChange("creditPayment", e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      row.creditPayment
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index
                      ? editedRow.totalDuePayment.toFixed(2)
                      : row.totalDuePayment.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      onClick={() => handleEditClick(index)}
                      color="primary"
                    >
                      {editIndex === index ? <SaveIcon /> : <EditIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell sx={{ textAlign: "left" }}>
                  <Typography variant="body1" fontWeight="bold">
                    Total
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.quantity}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.weight.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "right" }} />
                <TableCell sx={{ textAlign: "right" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.payment.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.duePayment.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.totalPayment.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.creditPayment.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {totals.totalDuePayment.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      {billsExtra && (
        <Card elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
          >
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography mb={1}>
                <strong>Morgav Rate:</strong> {billsExtra.morgavRate || "-"}
              </Typography>
              <Typography mb={1}>
                <strong>Additional Tip:</strong> {billsExtra.additionalTip || "-"}
              </Typography>
              <Typography mb={1}>
                <strong>Lifting Weight:</strong> {billsExtra.liftingWeight || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography mb={1}>
                <strong>Notes:</strong> {billsExtra.notes || "-"}
              </Typography>
              <Typography mb={1}>
                <strong>Expenses:</strong> {billsExtra.expenses || "-"}
              </Typography>
            </Grid>
            <Grid>
              <Typography ml={2}>
                <strong>Collected Cash Total:</strong> ₹{billsExtra.cashTotal} (
                500: {billsExtra.notes500 || 0}, 200: {billsExtra.notes200 || 0},
                100: {billsExtra.notes100 || 0}, 50: {billsExtra.notes50 || 0},
                20: {billsExtra.notes20 || 0}, 10: {billsExtra.notes10 || 0})
              </Typography>
            </Grid>
          </Grid>
        </Card>
      )}

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            mt: 3,
            bgcolor: "primary.main",
            ":hover": { bgcolor: "primary.dark" },
          }}
          onClick={() => navigate("/all-bills")}
        >
          Back to All Bills
        </Button>

        <Button
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: "secondary.main",
            ":hover": { bgcolor: "secondary.dark" },
          }}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default DetailedBill;
