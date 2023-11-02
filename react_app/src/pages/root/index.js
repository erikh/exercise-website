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
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Select from "@mui/material/Select";
import ReorderIcon from "@mui/icons-material/Reorder";
import AddIcon from "@mui/icons-material/Add";

let exercises = await getExercises();

async function getExercises() {
  return await fetch("/exercises").then((r) => r.json());
}

// mock for react development (the webserver isn't booted while it's up)
async function fakegetExercises() {
  return [{ id: 1, name: "exercise #1" }];
}

async function submitReps(setState) {
  alert("Submitted Reps");
}

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
        } else {
          setState({ success: true });
          exercises = await getExercises();
        }
      } catch (error) {
        setState({ error: error.message });
      }
    }
  }
}

export default function Root() {
  const [state, setState] = React.useState({
    open_menu: false,
    open_new_exercise: false,
    open_new_reps: true,
    error: null,
    success: false,
    selected_exercise: exercises.length > 0 ? exercises[0].id : 0,
  });

  const changeSelect = (event) => {
    setState({ open_new_reps: true, selected_exercise: event.target.value });
  };

  let exercise_list = (
    <Select
      displayEmpty={true}
      id="exercise_id"
      value={state["selected_exercise"]}
      autoWidth={true}
      onChange={changeSelect}
    >
      {exercises ? (
        exercises.map((e) => (
          <MenuItem key={e.id} value={e.id}>
            {e.name}
          </MenuItem>
        ))
      ) : (
        <React.Fragment />
      )}
    </Select>
  );

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

  let success = state["success"] ? (
    <Snackbar
      open={true}
      autoHideDuration={5000}
      onClose={() => setState({ success: false })}
    >
      <Alert>Success!</Alert>
    </Snackbar>
  ) : (
    <React.Fragment />
  );

  return (
    <React.Fragment>
      {error}
      {success}
      <IconButton
        style={{ visibility: !state["open_menu"] ? "visible" : "hidden" }}
        onClick={() => setState({ open_menu: true })}
      >
        <ReorderIcon />
      </IconButton>
      <Drawer anchor="left" open={state["open_menu"]}>
        <Box>
          <List>
            <ListItem>
              <ListItemButton
                onClick={() =>
                  setState({
                    open_menu: false,
                    open_new_exercise: true,
                    open_new_reps: false,
                  })
                }
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Exercise" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                onClick={() =>
                  setState({
                    open_menu: false,
                    open_new_reps: true,
                    open_new_exercise: false,
                  })
                }
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Reps" />
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
          {state["open_new_exercise"] ? (
            <form id="enter_exercise">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InputLabel>Exercise Name</InputLabel>
                </Grid>
                <Grid item xs={6}>
                  <Input name="name" size="30em" />
                </Grid>
                <Grid item xs={12}>
                  <Button onClick={() => submitExercise(setState)}>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            <React.Fragment />
          )}
          {state["open_new_reps"] ? (
            <form id="enter_reps">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InputLabel>Exercise</InputLabel>
                </Grid>
                <Grid item xs={6}>
                  {exercise_list}
                </Grid>
                <Grid item xs={6}>
                  <InputLabel>Reps</InputLabel>
                </Grid>
                <Grid item xs={6}>
                  <Input name="reps" size="5em" />
                </Grid>
                <Grid item xs={12}>
                  <Button onClick={() => submitReps(setState)}>Submit</Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            <React.Fragment />
          )}
        </Box>
      </div>
    </React.Fragment>
  );
}
