const API_END_POINT =
  "https://zl3m4qq0l9.execute-api.ap-northeast-2.amazonaws.com/dev";
const IMAGE_PATH_PREFIX =
  "https://fe-dev-matching-2021-03-serverlessdeploymentbuck-t3kpj3way537.s3.ap-northeast-2.amazonaws.com/public";

const request = async (nodeId) => {
  try {
    const res = await fetch(`${API_END_POINT}/${nodeId ? nodeId : ""}`);
    if (!res.ok) throw new Error("서버의 상태가 이상합니다!");
    return await res.json();
  } catch (e) {
    throw new Error(`무엇인가 잘못 되었습니다. ${e.message}`);
  }
};

function Nodes({ $app, initialState, onClick, onBackClick }) {
  this.state = initialState;
  this.onClick = onClick;
  this.onBackClick = onBackClick;
  this.$target = document.createElement("div");
  this.$target.className = "Nodes";
  $app.append(this.$target);

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  this.render = () => {
    const nodeTemplate = this.state.nodes
      .map((node) => {
        return `
		<div class="Node" data-node-id = "${node.id}">
			<img src="./assets/${node.type.toLowerCase()}.png"/>
			<div>${node.name}</div>
		</div>`;
      })
      .join("");

    this.$target.innerHTML = this.state.isRoot
      ? nodeTemplate
      : `<div class="Node">
	  		<img src = "./assets/prev.png"/>
		</div>
		${nodeTemplate}`;

    this.$target.querySelectorAll(".Node").forEach(($node) => {
      $node.addEventListener("click", (e) => {
        const { nodeId } = e.currentTarget.dataset;
        if (!nodeId) this.onBackClick();

        const selectedNode = this.state.nodes.find(
          (node) => node.id === nodeId
        );
        if (selectedNode) this.onClick(selectedNode);
      });
    });
  };

  this.render();
}

function Breadcrumb({ $app, initialState }) {
  this.state = initialState;
  this.$target = document.createElement("nav");
  this.$target.className = "Breadcrumb";
  $app.append(this.$target);

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  this.render = () => {
    this.$target.innerHTML = `<div class="nav-item">root</div>${this.state
      .map(
        (node, index) =>
          `<div class = "nav-item" data-index = "${index}">${node.name}</div>`
      )
      .join("")}`;
  };

  this.render();
}

function ImageView({ $app, initialState, onClick }) {
  this.state = initialState;
  this.onClick = onClick;
  this.$target = document.createElement("div");
  this.$target.className = "Modal ImageView";
  $app.append(this.$target);

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  this.render = () => {
    this.$target.innerHTML = `<div class="content">${
      this.state ? `<img src = "${IMAGE_PATH_PREFIX}${this.state}" />` : ""
    }</div>`;
    this.$target.style.display = this.state ? "block" : "none";
    this.$target.addEventListener("click", onClick);
  };

  this.render();
}

function App($app) {
  this.state = {
    isRoot: false,
    nodes: [],
    depth: [],
    selectedFilePath: null,
  };
  const imageView = new ImageView({
    $app,
    initialState: this.state.selectedFilePath,
    onClick: (e) => {
      if (e.target.nodeName !== "IMG")
        this.setState({ ...this.state, selectedFilePath: null });
    },
  });
  const breadcrumb = new Breadcrumb({ $app, initialState: this.state.depth }); //순서 상관 있나?
  const nodes = new Nodes({
    $app,
    initialState: { isRoot: this.state.isRoot, nodes: this.state.nodes },
    onClick: async (node) => {
      try {
        if (node.type === "DIRECTORY") {
          const nextNodes = await request(node.id);
          this.setState({
            ...this.state,
            isRoot: false,
            depth: [...this.state.depth, node],
            nodes: nextNodes,
          });
        } else if (node.type === "FILE") {
          this.setState({ ...this.state, selectedFilePath: node.filePath });
        }
      } catch (e) {
        throw new Error(e.message);
      }
    },
    onBackClick: async () => {
      try {
        const nextState = { ...this.state };
        nextState.depth.pop();
        const prevNodeId = nextState.depth.length
          ? nextState.depth[nextState.depth.length - 1].id
          : null;
        const prevNodes = await request(prevNodeId);
        this.setState({
          ...nextState,
          isRoot: !prevNodeId,
          nodes: prevNodes,
        });
      } catch (e) {
        throw new Error(e.message);
      }
    },
  });

  this.setState = (nextState) => {
    this.state = nextState;
    breadcrumb.setState(this.state.depth);
    nodes.setState({ isRoot: this.state.isRoot, nodes: this.state.nodes });
    imageView.setState(this.state.selectedFilePath);
  };

  this.init = async () => {
    try {
      const rootNodes = await request();
      console.log("rootNodes: ", rootNodes);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape")
          this.setState({ ...this.state, selectedFilePath: null });
      });
      this.setState({
        ...this.state,
        isRoot: true,
        nodes: rootNodes,
      });
    } catch (e) {
      throw new Error(e);
    }
  };

  this.init();
}

new App(document.querySelector(".App"));