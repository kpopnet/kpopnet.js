/**
 * Application entry point.
 */

import "./global.less";
import "./index.less";

import { onMount, createSignal } from "solid-js";
import Alerts, { showAlert } from "../alerts/alerts";
import Search from "../search/search";

// import {
//   BandMap,
//   getBandMap,
//   getIdolMap,
//   getProfiles,
//   IdolMap,
//   Profiles,
// } from "../api";
// import IdolList from "../idol-list";
// import "../labels";

/*
class Index extends Component<{}, IndexState> {
  private profiles: Profiles = null;
  private bandMap: BandMap = null;
  private idolMap: IdolMap = null;
  constructor() {
    super();
    this.state = {
      loading: true,
      loadingErr: false,
      query: "",
      file: null,
    };
  }
  public componentDidMount() {
    getProfiles().then(
      (profiles) => {
        this.profiles = profiles;
        this.bandMap = getBandMap(profiles);
        this.idolMap = getIdolMap(profiles);
        this.setState({ loading: false });
      },
      (err) => {
        this.setState({ loading: false, loadingErr: true });
        showAlert({
          title: "Fetch error",
          message: "Error getting profiles",
          sticky: true,
        });
      }
    );
  }
  public render({}, { loading, loadingErr, query, file }: any) {
  }
  private handleFile = (file: File) => {
    this.setState({ file });
  };
  private handleSearch = (query: string) => {
    this.setState({ query });
  };
  private handleRecognizeMatch = (idolId: string) => {
    // Everything must exist unless in a very rare case (e.g. new idols
    // was added after page load and user uploaded image with them.)
    const idol = this.idolMap.get(idolId);
    const iname = idol.name;
    const bname = this.bandMap.get(idol.band_id).name;
    const query = `name:${iname} band:${bname}`;
    this.setState({ query, file: null });
  };
  private handleRecognizeError = (err: Error) => {
    this.setState({ file: null });
    showAlert(["Recognize error", err.message]);
  };
}
*/

export default function Index() {
  let [loading, setLoading] = createSignal(true);
  let [loadingErr, _setLoadingErr] = createSignal(false);
  let [query, setQuery] = createSignal("");

  onMount(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  return (
    <main class="index">
      <div class="index__inner">
        <Alerts />
        <Search
          query={query()}
          setQuery={setQuery}
          loading={loading()}
          disabled={loadingErr()}
        />
        {/*!loading && !file && query && (
          <IdolList
            profiles={this.profiles}
            bandMap={this.bandMap}
            query={query}
          />
        )*/}
      </div>
      {/*<footer class="footer">
        <div class="footer__inner">
          <a class="footer__link" target="_blank" href="https://kpop.re/">
            Kpop.re
          </a>
          <a
            class="footer__link"
            target="_blank"
            href="https://github.com/kpopnet"
          >
            Source code
          </a>
          <a
            class="footer__link"
            target="_blank"
            href="https://github.com/kpopnet/kpopnet.json/issues"
          >
            Feedback
          </a>
        </div>
      </footer>*/}
    </main>
  );
}
