//all global variables here
let totalPages,
  totalrepos,
  repoPerPage,
  currentPage,
  gitUsername,
  reposCont,
  loadingSpinner,
  selectReposElem,
  pagination;
totalPages = 0;
totalrepos = 0;
repoPerPage = 10;
currentPage = 1;
gitUsername = "johnpapa";

reposCont = document.querySelector("#repos-cont");
loadingSpinner = document.querySelector("#loading-spinner");
selectReposElem = document.querySelector("#selectReposElem");
pagination = $(".pagination");

//fetching git user info
const fetchGitUserInfo = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

//fetching git user repos info
const fetchRepos = async (username, repoPerPage, page) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${repoPerPage}&page=${page}`
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

//setting git user info to html
const setgitUserInfo = (userData) => {
  let userAvatar,
    profileLink,
    userFullName,
    userBio,
    userLocation,
    userTwitterLink;

  userAvatar = document.querySelector("#user-avatar");
  profileLink = document.querySelector("#profile-link");
  userFullName = document.querySelector("#user-full-name");
  userBio = document.querySelector("#user-bio");
  userLocation = document.querySelector("#user-location");
  userTwitterLink = document.querySelector("#user-twitter-link");

  userAvatar.setAttribute("src", `${userData.avatar_url}`);
  profileLink.textContent = `${userData.html_url}`;
  profileLink.setAttribute("href", `${userData.html_url}`);
  userFullName.textContent = `${userData.name}`;
  userBio.textContent = `${userData.bio}`;
  userLocation.textContent = `${userData.location}`;
  userTwitterLink.textContent = `https://twitter.com/${userData.twitter_username}`;
  userTwitterLink.setAttribute(
    "href",
    `https://twitter.com/${userData.twitter_username}`
  );

  document.querySelector(".copy-profile-link-btn").onclick = (e) => {
    navigator.clipboard.writeText(profileLink.getAttribute("href"));
    alert("link copied");
  };
};

//setting git user repos to html
const setRepos = (reposData) => {
  reposCont.innerHTML = "";
  reposData.forEach((repo) => {
    let card = `<div class="card border border-1 border-dark " style="width: 25rem;min-height: 10rem">
                    <div class="card-body">
                        <h5 class="card-title text-primary fw-bolder text-truncate">${
                          repo.name
                        }</h5>
                        <p class="card-text fw-bolder text-truncate">${
                          repo.description
                            ? repo.description
                            : "No description here"
                        }</p>
                        <div class="d-flex flex-wrap gap-1">
                            ${repo.topics.slice(0, 4).map((topic, index) => {
                              if (index < 3) {
                                return `<button class="btn btn-primary fw-bold">${topic}</button>`;
                              } else {
                                return `<span class='text-bold fs-3'>...</span>`;
                              }
                            })}
                        </div>
                    </div>
                </div>`;
    reposCont.insertAdjacentHTML("beforeend", card);
  });
};

//set pagination and render content
const setPaginationAndRenderRepos = (totalPages, gitUsername, repoPerPage) => {
  pagination.twbsPagination({
    totalPages: totalPages,
    visiblePages: 9,
    next: `Newer`,
    prev: "Older",
    onPageClick: async function (event, page) {
      //fetch content and render here
      currentPage = page;
      //show spinners
      reposCont.innerHTML = "";
      loadingSpinner.classList.toggle("hide");

      //loading content second
      let func1 = async () => {
        try {
          let reposdata = await fetchRepos(
            gitUsername,
            repoPerPage,
            (page = page)
          );
          //hide spinners
          loadingSpinner.classList.toggle("hide");
          setRepos(reposdata);
        } catch (e) {
          console.log("something went wrong.");
        }
      };
      setTimeout(() => {
        func1();
      }, 300);
    },
  });
};

//remove pagination
const removePaginationAndMake = () => {
  pagination.remove();
  document
    .querySelector("#paginationCont")
    .insertAdjacentHTML("afterbegin", `<ul class='pagination'></ul>`);
  pagination = $(".pagination");
};

//main function
const main = async () => {
  //render userprofile data to html
  let userdata = await fetchGitUserInfo((username = gitUsername));
  totalrepos = userdata.public_repos;
  totalPages = Math.ceil(totalrepos / repoPerPage);
  setgitUserInfo(userdata);

  setPaginationAndRenderRepos(totalPages, gitUsername, repoPerPage);

  selectReposElem.onchange = (e) => {
    let target = e.target;
    if (target.selectedIndex) {
      repoPerPage = parseInt(selectReposElem.value);
      totalPages = Math.ceil(totalrepos / repoPerPage);
      Array.from(selectReposElem.children).map((element) => {
        element.removeAttribute("selected");
      });
      target.setAttribute("selected", "true");
      removePaginationAndMake();
      setPaginationAndRenderRepos(totalPages, gitUsername, repoPerPage);
    }
  };
};

//executing main function
main();
