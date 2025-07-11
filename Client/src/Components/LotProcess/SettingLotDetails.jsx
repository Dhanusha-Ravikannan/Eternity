import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper, TableFooter } from "@mui/material";
import { FaEye } from "react-icons/fa";
import { Delete } from '@mui/icons-material';
import styles from './SettingLotDetails.module.css';
import Navbar from '../Navbar/Navbar';

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const SettingLotDetails = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(getTodayDate());
  const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
const [statusFilter, setStatusFilter] = useState("All");
const [wastagePercent, setWastagePercent] = useState('');
const [givenGold, setGivenGold] = useState('');


const filteredEntries = entries.filter(entry => {
  const entryDate = new Date(entry.date);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  const isCompleted = !!entry.receiptWeight;
  const statusMatch =
    statusFilter === "All" ||
    (statusFilter === "Completed" && isCompleted) ||
    (statusFilter === "Pending" && !isCompleted);
  return (
    (!from || entryDate >= from) &&
    (!to || entryDate <= to) &&
    statusMatch
  );
});

  const items = [
    { item: "Ring", beforeWeight: "50", touch: "92", purity: "22K", remarks: 'aaaa' },
    { item: "Chain", beforeWeight: "48", touch: "91", purity: "22K", remarks: 'bbbb' },
    { item: "Stud", beforeWeight: "55", touch: "90", purity: "22K", remarks: 'cccc' }
  ];

  const handleToggle = (item) => {
    if (isAlreadyAssigned(item)) return;
    setSelectedItems(prev =>
      prev.find(i => i.item === item.item)
        ? prev.filter(i => i.item !== item.item)
        : [...prev, item]
    );
  };

  const handleAssign = () => {
    if (!date) {
      alert("Please Select the Date to Assign the Item");
      return;
    }
    if (!selectedItems.length) {
      alert("Select at least one item.");
      return;
    }
  
    const newEntry = {
      id: Date.now(),
      date,
      items: selectedItems.map(it => ({
        ...it
      })),
      afterWeight: '',
      stoneCount: '',
      stoneWeight: '',
      extraRemarks: '',
      scrapItems: [],
      totalIssueWeight: totalIssueWeight.toFixed(2),
    };
  
    setEntries(prev => [...prev, newEntry]);
    setSelectedItems([]);
    setDate(getTodayDate());
    setIsAssignOpen(false);
  };
  

  const isAlreadyAssigned = (item) => {
    return entries.some(entry => entry.items.some(i => i.item === item.item));
  };

  const getTotalScrapWeight = (scrapItems) => {
    return scrapItems?.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0).toFixed(2);
  };


  const getOverallBalance = () => {
    return filteredEntries.reduce((total, group) => {
      if (!group.afterWeight) return total;
  
      const issueSum = group.items.reduce(
        (sum, item) => sum + parseFloat(item.beforeWeight || 0),
        0
      );
  
      const afterWeight = parseFloat(group.afterWeight || 0);
      const stoneWeight = parseFloat(group.stoneWeight || 0);
      const scrapWeight = parseFloat(getTotalScrapWeight(group.scrapItems || []));
  
      const balance =
        issueSum - (afterWeight - stoneWeight) - scrapWeight;
  
      return total + (isNaN(balance) ? 0 : balance);
    }, 0).toFixed(2);
  };
  
  
  const getTotalStoneCount = () => {
    return filteredEntries.reduce((total, group) => {
      const count = parseFloat(group.stoneCount || 0);
      return total + (isNaN(count) ? 0 : count);
    }, 0).toFixed(2);
  };
  
  
  const totalStoneCount = getTotalStoneCount(); 


  const totalIssueWeight = selectedItems.reduce(
    (sum, item) => sum + parseFloat(item.beforeWeight || 0),
    0
  );

  const totalWastage = (Number(totalStoneCount) * Number(wastagePercent || 0)) / 100;
  const closingBalance = parseFloat(getOverallBalance()) - parseFloat(totalWastage);
  const finalClosingBalance = closingBalance + Number(givenGold || 0);

  return (
    <>
      <Navbar />
      <div className="date-fields">
        <TextField
            id="from-date"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            sx={{ marginLeft: "3.5rem" , mt:'1.5rem'}}
          />
          <TextField
            id="to-date"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ marginLeft: "1.5rem", mt:'1.5rem' }}
          />
<TextField
  select
  label="Status"
  SelectProps={{ native: true }}
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  sx={{ marginLeft: "1.5rem", minWidth: 120 , mt:'1.5rem' }}
>
  <option value="All">All</option>
  <option value="Completed">Completed</option>
  <option value="Pending">Pending</option>
</TextField>

          <Button
             onClick={() => setIsAssignOpen(true)}
            sx={{
              m: 3,
              marginLeft: 85,
              backgroundColor: "#5f4917",
              color: "white",
              paddingLeft:2,
              paddingRight:2
            }}
          >
           Add Setting Items
          </Button>
        </div> 

      {/* Entries Table */}
      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
      <Box> 
      <div className={styles.tablecontainer}>
        <TableContainer component={Paper} >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>S.No</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Date</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Process</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Issue</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Receipt</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Stone Count</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Stone Weight</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Scrap Weight</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Balance</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Wastage</b></TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}><b>Actions</b></TableCell>               
              </TableRow>
            </TableHead>

            <TableBody>
  {filteredEntries.length === 0 ? (
    <TableRow>
      <TableCell colSpan={10} align="center">
        No Product Found
      </TableCell>
    </TableRow>
  ) : (
    filteredEntries.map((group, i) => (
      <React.Fragment key={group.id}>
        <TableRow>
          <TableCell align="center" rowSpan={group.items.length}>{i + 1}</TableCell>
          <TableCell align="center" rowSpan={group.items.length}>{group.date}</TableCell>
          <TableCell align="center">{group.items[0].item}</TableCell>
          <TableCell align="center">{group.items[0].beforeWeight}</TableCell>
           <TableCell align="center" rowSpan={group.items.length}>{group.afterWeight || '—'}</TableCell>
           <TableCell align="center" rowSpan={group.items.length}>{group.stoneCount || '—'}</TableCell>
           <TableCell align="center" rowSpan={group.items.length}>{group.stoneWeight || '—'}</TableCell>
           <TableCell align="center" rowSpan={group.items.length}> {getTotalScrapWeight(group.scrapItems)} g </TableCell>
          <TableCell align="center" rowSpan={group.items.length}>
  {group.afterWeight
    ? (
        group.items.reduce((sum, item) => sum + parseFloat(item.beforeWeight || 0), 0) -
        (parseFloat(group.afterWeight || 0) - parseFloat(group.stoneWeight || 0)) -
        parseFloat(getTotalScrapWeight(group.scrapItems || []))
      ).toFixed(2)
    : '—'} g
</TableCell>

<TableCell align="center" rowSpan={group.items.length}>
  {group.wastage || '—'}
</TableCell>


<TableCell align="center" rowSpan={group.items.length}>
  <FaEye style={{ cursor: 'pointer' }} onClick={() => setViewEntry(group)} />
</TableCell>
     
        </TableRow>
        {group.items.slice(1).map((item, idx) => (
          <TableRow key={`${group.id}-${idx}`}>
            <TableCell>{item.item}</TableCell>
            <TableCell>{item.beforeWeight}</TableCell>
          </TableRow>
        ))}
      </React.Fragment>
    ))
  )}
</TableBody>
          </Table>
          
        </TableContainer>     
      </div>
      </Box>

      <Box
    sx={{
      width: '18rem',
      p: 2,
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      height: 'fit-content'
    }}
  >
    <Typography sx={{marginLeft:'5rem', color:'darkblue'}}><b> Opening Balance: 0 </b>  </Typography> <hr/>
    <Typography  sx={{ color: 'red', fontWeight:'bold', fontSize:'1.1rem' }}>
      Monthly Wastage
    </Typography>

    <Typography sx={{mt:2}}>
  <strong>Total Stone Count:</strong> {getTotalStoneCount()} g
</Typography>

<TextField
  label="Wastage (%)"
  type="number"
  fullWidth
  size="small"
  value={wastagePercent}
  onChange={(e) => setWastagePercent(e.target.value)}
  sx={{ mt: 2 }}
/>

<Typography sx={{ mt: 2 }}>
  <strong>Total Wastage:</strong>{' '}
  {Number(totalStoneCount).toFixed(2)} × {Number(wastagePercent) || 0} / 100 ={' '}
  <strong>{!isNaN(totalWastage) ? Number(totalWastage).toFixed(2) : '0.00'} g</strong>
</Typography>

    <Typography sx={{ mt: 2 }}><strong>Overall Balance:</strong> 
    {getOverallBalance()}g
    </Typography>

<Typography sx={{ mt: 1 , color:'red'}}>
  <strong>Closing Balance:</strong> {closingBalance.toFixed(2)}g
</Typography>

{closingBalance < 0 && (
  <TextField
    label="Given Gold from owner (g)"
    type="number"
    fullWidth
    size="small"
    value={givenGold}
    onChange={(e) => setGivenGold(e.target.value)}
    sx={{ mt: 2 }}
  />
)}

<Typography
  sx={{
    mt: 2,
    fontWeight: 'bold',
    color:
      finalClosingBalance > 0
        ? 'green'
        : finalClosingBalance < 0
        ? 'red'
        : 'black',
  }}
>
  {finalClosingBalance > 0
    ? `Worker should give ${Math.abs(finalClosingBalance).toFixed(2)}g to Owner`
    : finalClosingBalance < 0
    ? `Owner should give ${Math.abs(finalClosingBalance).toFixed(2)}g to Worker`
    : 'No balance due'}
</Typography>

    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ mt: 3, backgroundColor: '#1a1a1f', color: 'white' }}
    >
      Save Summary
    </Button>

<Button
  variant="outlined"
  color="error"
  sx={{ mt: 2, width: '100%' }}
  onClick={() => {
    const confirmed = window.confirm("Are you sure you want to close this jobcard?");
    if (confirmed) {
      const existingLots = JSON.parse(localStorage.getItem("settingLots")) || [];
      const newLot = {
        id: existingLots.length + 1,
        entries,
        summary: {
          totalStoneCount,
          wastagePercent,
          totalWastage: totalWastage.toFixed(2),
          overallBalance: getOverallBalance(),
          closingBalance: closingBalance.toFixed(2),
          givenGold,
          finalClosingBalance: finalClosingBalance.toFixed(2)
        }
      };
      localStorage.setItem("settingLots", JSON.stringify([...existingLots, newLot]));
      alert("Jobcard closed successfully!");
      window.location.href = "/settinglot"; 
    }
  }}
>
  Close Jobcard
</Button>
  </Box>
      </Box>
      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onClose={() => setIsAssignOpen(false)} fullWidth maxWidth={false} PaperProps={{ sx: { width: '50rem !important' } }}>
        <DialogTitle>Assign Setting Items</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              sx={{ mt: '1rem' }}
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Typography variant="h6">Available Setting Items</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Select</TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Item</TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Issue</TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Touch</TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Purity</TableCell>
                <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>Remarks</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, index) => (
       
                <TableRow
  key={index} hover style={{ backgroundColor: isAlreadyAssigned(item) ? "#d4edda" : "transparent" }} >
  <TableCell>
    <Checkbox
      checked={!!selectedItems.find(i => i.item === item.item)}
      onChange={() => handleToggle(item)}
      disabled={isAlreadyAssigned(item)}
    />
  </TableCell>
  <TableCell>{item.item}</TableCell>
  <TableCell>{item.beforeWeight}</TableCell>
  <TableCell>{item.touch}</TableCell>
  <TableCell>{item.purity}</TableCell>
  <TableCell>{item.remarks}</TableCell>
</TableRow>

              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onClose={() => setViewEntry(null)} fullWidth maxWidth={false} PaperProps={{ sx: { width: '60rem !important' } }}>
        <DialogTitle>Assigned Item Details</DialogTitle>
        <DialogContent>
          {viewEntry && (
            <>
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Date</TableCell>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Item</TableCell>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Issue</TableCell>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Touch</TableCell>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Purity</TableCell>
                    <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>

<TableBody>
  {viewEntry.items.map((item, idx) => (
    <TableRow key={idx}>
      <TableCell>{viewEntry.date}</TableCell>
      <TableCell>{item.item}</TableCell>
      <TableCell>{item.beforeWeight}g</TableCell>
      <TableCell>{item.touch}</TableCell>
      <TableCell>{item.purity}</TableCell>
      <TableCell>{item.remarks}</TableCell>
    </TableRow>
  ))}
</TableBody> 
<TableFooter>
    <TableRow>
      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>
        {viewEntry.items.reduce((sum, item) => sum + parseFloat(item.beforeWeight || 0), 0).toFixed(2)} g
      </TableCell>
      <TableCell />
      <TableCell sx={{ fontWeight: 'bold' }}>
        {viewEntry.items.reduce((sum, item) => sum + parseFloat(item.purity || 0), 0).toFixed(2)}
      </TableCell>
      <TableCell />
    </TableRow>
  </TableFooter>
              </Table>


              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <TextField label="Receipt Weight" type="number" fullWidth required value={viewEntry.afterWeight || ''} onChange={(e) => setViewEntry({ ...viewEntry, afterWeight: e.target.value })} />
                <TextField label="Stone Count" type="number" fullWidth value={viewEntry.stoneCount || ''} onChange={(e) => setViewEntry({ ...viewEntry, stoneCount: e.target.value })} />
                <TextField label="Stone Weight" type="number" fullWidth value={viewEntry.stoneWeight || ''} onChange={(e) => setViewEntry({ ...viewEntry, stoneWeight: e.target.value })} />
                <TextField label="Remarks" fullWidth value={viewEntry.extraRemarks || ''} onChange={(e) => setViewEntry({ ...viewEntry, extraRemarks: e.target.value })} />
              </Box>

{viewEntry && (() => {
  const afterWeight = parseFloat(viewEntry.afterWeight || 0);
  const stoneWeight = parseFloat(viewEntry.stoneWeight || 0);
  const totalIssuedWeight = viewEntry.items.reduce((sum, item) => sum + parseFloat(item.beforeWeight || 0), 0);
  const totalScrapWeight = parseFloat(getTotalScrapWeight(viewEntry.scrapItems));

  const total = afterWeight - stoneWeight;
  const totalBalance =  totalIssuedWeight - total;
  const finalBalance = totalBalance - totalScrapWeight;

  return (
    <Box sx={{ mt: 3, display:'flex', gap:'4.5rem' }}>
      <Typography><strong>Total:</strong> {total.toFixed(2)}g </Typography>
      <Typography><strong>Total Balance:</strong> {totalBalance.toFixed(2)}g </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft:'17rem' }}>
    <Typography variant="subtitle1"><b>Wastage:</b></Typography>
    <Button
      variant={viewEntry?.wastage === 'Yes' ? 'contained' : 'outlined'}
      color="success"
      onClick={() => setViewEntry({ ...viewEntry, wastage: 'Yes' })}
    >
      Yes
    </Button>
    <Button
      variant={viewEntry?.wastage === 'No' ? 'contained' : 'outlined'}
      color="error"
      onClick={() => setViewEntry({ ...viewEntry, wastage: 'No' })}
    >
      No
    </Button>
  </Box>
    </Box>
  );
})()}

<Box sx={{ mt: 2 }}>
  <Button 
   sx={{
    paddingLeft:2,
    paddingRight:2
  }}
    variant="outlined"
    onClick={() =>
      setViewEntry({
        ...viewEntry,
        scrapItems: [
          ...(viewEntry.scrapItems || []),
          { itemName: '', weight: '', hasStone: 'No', touch: '', purity: '', remarks: '' },
        ],
      })
    }
  >
    Add Scrap Items
  </Button>

  <Box
    sx={{
      maxHeight: '12rem', 
      overflowY: (viewEntry.scrapItems?.length || 0) > 3 ? 'auto' : 'visible',
      mt: 1,
    }}
  >
    <Table size="small" stickyHeader >
      <TableHead>
        <TableRow >
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >S.No</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >Item Name</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >Weight</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >Touch</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >Purity</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }} >Remarks</TableCell>
          <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center' , fontWeight:'bold' }}> Actions </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(viewEntry.scrapItems || []).map((item, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <TextField
                size="small"
                value={item.itemName}
                onChange={(e) => {
                  const updated = [...viewEntry.scrapItems];
                  updated[index].itemName = e.target.value;
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                type="number"
                value={item.weight}
                onChange={(e) => {
                  const updated = [...viewEntry.scrapItems];
                  updated[index].weight = e.target.value;
                  const weight = parseFloat(e.target.value) || 0;
                  const touch = parseFloat(updated[index].touch) || 0;
                  updated[index].purity = ((weight * touch) / 100).toFixed(2);
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                value={item.touch}
                onChange={(e) => {
                  const updated = [...viewEntry.scrapItems];
                  updated[index].touch = e.target.value;
                  const weight = parseFloat(updated[index].weight) || 0;
                  const touch = parseFloat(e.target.value) || 0;
                  updated[index].purity = ((weight * touch) / 100).toFixed(2);
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                value={item.purity}
                onChange={(e) => {
                  const updated = [...viewEntry.scrapItems];
                  updated[index].purity = e.target.value;
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                value={item.remarks}
                onChange={(e) => {
                  const updated = [...viewEntry.scrapItems];
                  updated[index].remarks = e.target.value;
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              />
            </TableCell>
            <TableCell>
              <Button
                color="error"
                size="small"
                onClick={() => {
                  const updated = [...viewEntry.scrapItems];
                  updated.splice(index, 1);
                  setViewEntry({ ...viewEntry, scrapItems: updated });
                }}
              >
                <Delete />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
</Box>

<Box sx={{ mt: 2 }}>

<Typography variant="subtitle1">
      <strong>Total Scrap Weight:</strong> {getTotalScrapWeight(viewEntry.scrapItems)} g
    </Typography>
  <Typography variant="subtitle1">
    <strong>Balance:</strong> {
      viewEntry.afterWeight && viewEntry.stoneWeight
        ? (
            viewEntry.items.reduce((sum, item) => sum + parseFloat(item.beforeWeight || 0), 0)
            - (parseFloat(viewEntry.afterWeight || 0) - parseFloat(viewEntry.stoneWeight || 0))
            - parseFloat(getTotalScrapWeight(viewEntry.scrapItems))
          ).toFixed(2)
        : '—'
    } g
  </Typography>
</Box>
           </>
          )}
        </DialogContent>
        <DialogActions>
        <Button
  variant="contained"
  color="primary"
  disabled={viewEntry?.wastage !== 'Yes' && viewEntry?.wastage !== 'No'}
  onClick={() => {
    if (!viewEntry.afterWeight) {
      alert("Please enter After Weight");
      return;
    }

            const updated = entries.map(entry =>
              entry.id === viewEntry.id ? {
                ...entry,
                ...viewEntry,
                receiptWeight: viewEntry.afterWeight,
              } : entry
            );
            
            setEntries(updated);
            setViewEntry(null);
          }}
          
          >
            Save
          </Button>
          <Button onClick={() => setViewEntry(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingLotDetails;




