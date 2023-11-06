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
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Select from "@mui/material/Select";
import ReorderIcon from "@mui/icons-material/Reorder";
import AddIcon from "@mui/icons-material/Add";

import ExerciseLog from "../../components/exercise_log";

import { getExercises } from "../../lib/fetches";
// see the comments in lib/mock_fetches/index.js for more information.
// import { getExercises } from "../../lib/mock_fetches";

import { assignProperties, submitForm } from "../../lib/utils";

let exercises = await getExercises();

const stateTemplate = {
  open_menu: false,
  open_new_exercise: false,
  open_new_reps: false,
  open_log: false,
  error: null,
  success: false,
  selected_exercise: exercises.length > 0 ? exercises[0].id : 0,
};

async function submitReps(setState) {
  submitForm(
    "enter_reps",
    "/input/reps",
    stateTemplate,
    setState,
    (obj) => ({
      selected_exercise: obj.exercise_id,
      open_new_reps: true,
    }),
    (element, obj) => {
      switch (element.name) {
        case "exercise_id":
          obj.exercise_id = parseInt(element.value);
          break;
        case "count":
          obj.count = parseInt(element.value);
          break;
        default:
          break;
      }

      return obj;
    },
    null
  );
}

async function submitExercise(setState) {
  submitForm(
    "enter_exercise",
    "/input/exercise",
    stateTemplate,
    setState,
    (obj) => ({
      open_new_reps: true,
    }),
    (element, obj) => {
      switch (element.name) {
        case "name":
          obj.name = element.value;
          break;
        default:
          break;
      }

      return obj;
    },
    async () => {
      exercises = await getExercises();
    }
  );
}

export default function Root() {
  const [state, setState] = React.useState(
    assignProperties(stateTemplate, { open_new_reps: true })
  );

  const changeSelect = (event) => {
    setState(
      assignProperties(stateTemplate, {
        open_new_reps: true,
        selected_exercise: event.target.value,
      })
    );
  };

  let exercise_list = (
    <Select
      displayEmpty={true}
      name="exercise_id"
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
      onClose={() =>
        setState(
          assignProperties(stateTemplate, {
            open_new_reps: state["open_new_reps"],
            open_new_exercise: state["open_new_exercise"],
            open_menu: state["open_menu"],
            error: null,
            selected_exercise: exercises.length > 0 ? exercises[0].id : 0,
          })
        )
      }
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
      onClose={() =>
        setState(
          assignProperties(stateTemplate, {
            open_new_reps: state["open_new_reps"],
            open_new_exercise: state["open_new_exercise"],
            open_menu: state["open_menu"],
            success: false,
            selected_exercise: exercises.length > 0 ? exercises[0].id : 0,
          })
        )
      }
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
        onClick={() =>
          setState(
            assignProperties(stateTemplate, {
              open_menu: true,
              open_new_reps: false,
              selected_exercise: exercises.length > 0 ? exercises[0].id : 0,
            })
          )
        }
      >
        <ReorderIcon />
      </IconButton>
      <Drawer anchor="left" open={state["open_menu"]}>
        <Box>
          <List>
            <ListItem>
              <ListItemButton
                onClick={() =>
                  setState(
                    assignProperties(stateTemplate, {
                      open_new_exercise: true,
                      open_new_reps: false,
                      selected_exercise:
                        exercises.length > 0 ? exercises[0].id : 0,
                    })
                  )
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
                onClick={() => setState(assignProperties(stateTemplate, {}))}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Reps" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                onClick={() =>
                  setState(
                    assignProperties(stateTemplate, {
                      open_log: true,
                    })
                  )
                }
              >
                <ListItemIcon>
                  <ReorderIcon />
                </ListItemIcon>
                <ListItemText primary="Exercise Log" />
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
                  <Input name="count" size="5em" />
                </Grid>
                <Grid item xs={12}>
                  <Button onClick={() => submitReps(setState)}>Submit</Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            <React.Fragment />
          )}
          {state["open_log"] ? <ExerciseLog /> : <React.Fragment />}
        </Box>
      </div>
    </React.Fragment>
  );
}
