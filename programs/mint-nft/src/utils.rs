
pub fn add_avatar_to_url(url: &str) -> String {
  if url.ends_with('/') {
      format!("{}avatar.json", url)
  } else {
      format!("{}/avatar.json", url)
  }
}

pub fn get_nft_uri(url: &str, id: i64) -> String {
  if url.ends_with('/') {
      format!("{}{}.{}", url, id, "json")
  } else {
    format!("{}/{}.{}", url, id, "json")
  }
}