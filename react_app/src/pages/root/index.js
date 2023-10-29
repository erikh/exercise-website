import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";

function submitExercise() {
  alert("submitting");
}

export default function Root() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InputLabel>Exercise Name</InputLabel>
        </Grid>
        <Grid item xs={6}>
          <Input name={"name"} size={"30em"} />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={submitExercise}>Submit</Button>
        </Grid>
      </Grid>
    </Box>
  );
}
