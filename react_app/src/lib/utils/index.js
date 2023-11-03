export function assignProperties(stateTemplate, props) {
  return Object.assign({}, stateTemplate, props);
}

// this somewhat unwieldy function simplifies the process of submitting data
// via POST and through window.fetch, and using the result to prime react's
// state management system.
//
// - name is the name of the form you're reading
// - route is the path to the POST endpoint
// - stateTemplate is a starter set of state which will be merged by
//   assignProperties.
// - setState is react's state modification function passed in for use by this
//   call.
// - addlPropsFunc is an additional set of properties to merge with
//   state after the request has been completed. It is passed the request
//   object in its final form.
// - transformFunc is a custom function that takes a form element and starter
//   object. It returns an object which replaces the existing object passed to
//   it. This function will be called for every form element in a loop.
// - postRequestFunc is an async function that will be called if the request completes
//   successfully, regardless of its status. It takes no parameters and no
//   return values are expected. If null is passed, nothing will be called.
//
// Additional states will be added based on the result of the request.
// `success` will be set to true if the request was successful. If there is an
// error, `error` will be set to the error message text, whether that be
// internally to javascript or the body of the HTTP request on a non-200
// status.
export async function submitForm(
  name,
  route,
  stateTemplate,
  setState,
  addlPropsFunc,
  transformFunc,
  postRequestFunc
) {
  let obj = {};

  try {
    let form = document.getElementById(name);

    for (var i = 0; i < form.length; i++) {
      obj = transformFunc(form.elements[i], obj);
    }

    let response = await fetch(route, {
      method: "POST",
      body: JSON.stringify(obj),
    });

    if (response.status !== 200) {
      setState(
        assignProperties(
          stateTemplate,
          assignProperties(addlPropsFunc(obj), {
            error: await new Response(response.body).text(),
          })
        )
      );
    } else {
      setState(
        assignProperties(
          stateTemplate,
          assignProperties(addlPropsFunc(obj), {
            success: true,
          })
        )
      );
    }

    if (postRequestFunc) {
      await postRequestFunc();
    }
  } catch (error) {
    setState(
      assignProperties(
        stateTemplate,
        assignProperties(addlPropsFunc(obj), {
          error: error.message,
        })
      )
    );
  }
}
