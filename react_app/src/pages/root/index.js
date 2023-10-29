import React from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ReorderIcon from "@mui/icons-material/Reorder";
import AddIcon from "@mui/icons-material/Add";

async function submitExercise(setState) {
  let form = document.getElementById("enter_exercise");
  for (var i = 0; i < form.length; i++) {
    if (form.elements[i].name === "name") {
      try {
        let response = await fetch("/input/exercise", {
          method: "POST",
          body: JSON.stringify({ name: form.elements[i].value }),
        });

        if (response.status !== 200) {
          setState({ error: await new Response(response.body).text() });
        }
      } catch (error) {
        setState({ error: error.message });
      }
    }
  }
}

export default function Root() {
  const [state, setState] = React.useState({
    open: true,
    error: null,
  });

  let error = state["error"] ? (
    <Snackbar
      open={true}
      autoHideDuration={5000}
      onClose={() => setState({ error: null })}
    >
      <Alert severity="error">{state["error"]}</Alert>
    </Snackbar>
  ) : (
    <React.Fragment />
  );

  return (
    <React.Fragment>
      {error}
      <IconButton>
        <ReorderIcon
          style={{ visibility: !state["open"] ? "visible" : "hidden" }}
          onClick={() => setState({ open: true })}
        />
      </IconButton>
      <Drawer anchor="left" open={state["open"]}>
        <Box>
          <List>
            <ListItem>
              <ListItemButton onClick={() => setState({ open: false })}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Exercise" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <div
        style={{
          marginTop: "25%",
          marginBottom: "25%",
          marginLeft: "25%",
          marginRight: "25%",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <form id="enter_exercise" action={false}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <InputLabel>Exercise Name</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <Input name="name" size="30em" />
              </Grid>
              <Grid item xs={12}>
                <Button onClick={() => submitExercise(setState)}>Submit</Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </div>
    </React.Fragment>
  );
}
