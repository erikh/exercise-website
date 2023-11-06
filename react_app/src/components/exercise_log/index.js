import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";

import { getLog } from "../../lib/fetches";
// see the comments in lib/mock_fetches/index.js for more information.
// import { getLog } from "../../lib/mock_fetches";

const log = await getLog();

export default function ExerciseLog() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Exercise Name</TableCell>
            <TableCell>Reps</TableCell>
            <TableCell>Time Entered</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {log.map((l) => (
            <TableRow>
              <TableCell>{l.name}</TableCell>
              <TableCell>{l.count}</TableCell>
              <TableCell>{new Date(l.date).toLocaleString("en-US")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
