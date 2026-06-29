import java.sql.*;
public class ListTables {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/quiz_db", "postgres", "abc@06@2003");
        ResultSet rs = conn.getMetaData().getTables(null, "public", "%", new String[]{"TABLE"});
        while(rs.next()) {
            System.out.println("TABLE: " + rs.getString("TABLE_NAME"));
        }
        conn.close();
    }
}
