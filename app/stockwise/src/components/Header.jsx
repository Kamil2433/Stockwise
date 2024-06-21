
import styles from "./navbar.module.css";

const navLinks = [
    {
      id:1,
      title:"Home",
      url:"/",
    },
    {
      id:2,
      title:"Blogs",
      url:"/blogs"
    },

    {
      id:3,
      title:"Dashboard",
      url:"/dashboard"
    }
  ]

const Header = () => {

    <div className={styles.container}>
    <div className={styles.logo}>NextBlog.com</div>
    <div className={styles.links}>
    {navLinks.map(item=>(
      <div key={item.id} href={item.url}>{item.title}</div>
    ))}
 
    </div>
  </div>
};

export default Header;